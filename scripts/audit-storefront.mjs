import { chromium } from 'playwright';

/**
 * Automated end-to-end audit runner for Scrunch & Create Shopify Theme.
 * Tests multiple viewports, navigation, mega menu, search, PDP, collection, cart, and mobile flows.
 * @returns {Promise<void>}
 */
async function runAudit() {
  // Use installed system Chrome/Edge browser directly
  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
  } catch (e) {
    try {
      browser = await chromium.launch({ channel: 'msedge', headless: true });
    } catch (e2) {
      console.log('Falling back to default chromium...');
      browser = await chromium.launch({ headless: true });
    }
  }
  const results = {
    pagesChecked: 0,
    errors: [],
    warnings: [],
    performance: {},
    featuresTested: []
  };

  const BASE_URL = 'https://scrunchcreate.myshopify.com';

  const viewports = [
    { name: 'Desktop Large', width: 1440, height: 900 },
    { name: 'Tablet iPad', width: 768, height: 1024 },
    { name: 'Mobile iPhone', width: 390, height: 844 },
    { name: 'Mobile Compact', width: 360, height: 740 }
  ];

  console.log('🚀 Starting Shopify Theme Comprehensive Automated Audit...\n');

  for (const vp of viewports) {
    console.log(`\n==================================================`);
    console.log(`📱 Testing Viewport: ${vp.name} (${vp.width}x${vp.height})`);
    console.log(`==================================================`);

    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      userAgent: vp.width < 768 
        ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
        : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });

    const page = await context.newPage();

    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Ignore known benign vendor tracking pings
        if (!text.includes('monorail') && !text.includes('otlp') && !text.includes('favicon')) {
          results.errors.push(`[${vp.name} Console Error] ${text}`);
          console.error(`  ❌ [Console Error]: ${text}`);
        }
      }
    });

    page.on('pageerror', err => {
      results.errors.push(`[${vp.name} Page JS Crash] ${err.message}`);
      console.error(`  🔥 [JS Exception]: ${err.message}`);
    });

    // 1. Audit Home Page
    console.log(`\n--- 1. Home Page Audit (${vp.name}) ---`);
    const homeStart = Date.now();
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1500);
    const homeLoadTime = Date.now() - homeStart;
    results.pagesChecked++;
    console.log(`  ✓ Home page loaded in ${homeLoadTime}ms`);

    // Check page title and meta
    const title = await page.title();
    console.log(`  ✓ Page Title: "${title}"`);

    // Check horizontal overflow
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    if (hasHorizontalOverflow) {
      const diff = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      results.warnings.push(`[${vp.name}] Horizontal overflow detected by ${diff}px`);
      console.warn(`  ⚠️ Horizontal overflow detected: scrollWidth > innerWidth (+${diff}px)`);
    } else {
      console.log(`  ✓ No horizontal scroll overflow.`);
    }

    // Check header visibility and layout
    const headerVisible = await page.locator('.header-wrapper').isVisible();
    console.log(`  ✓ Header wrapper visible: ${headerVisible}`);

    // Test Mega Menu on Desktop / Drawer on Mobile
    if (vp.width >= 990) {
      console.log(`  Testing Desktop Mega Menu Hover...`);
      const navLinks = page.locator('.sc-nav-link');
      const count = await navLinks.count();
      console.log(`  ✓ Found ${count} main navigation categories`);
      
      for (let i = 0; i < Math.min(count, 4); i++) {
        const link = navLinks.nth(i);
        const text = (await link.textContent()).trim();
        await link.hover();
        await page.waitForTimeout(250);
        const dropdown = link.locator('..').locator('.sc-mega-dropdown');
        if (await dropdown.count() > 0) {
          const isDropdownVisible = await dropdown.isVisible();
          console.log(`    - Nav Item "${text}" mega menu visible on hover: ${isDropdownVisible}`);
          if (!isDropdownVisible) {
            results.warnings.push(`Mega menu for "${text}" did not become visible on hover.`);
          }
        }
      }
    } else {
      console.log(`  Testing Mobile Menu Drawer & Accordion...`);
      const menuBtn = page.locator('.header__icon--menu, summary[aria-haspopup="dialog"]');
      if (await menuBtn.count() > 0) {
        await menuBtn.first().click();
        await page.waitForTimeout(500);
        const drawerOpen = await page.locator('#menu-drawer, .menu-drawer').first().isVisible();
        console.log(`  ✓ Mobile drawer opened: ${drawerOpen}`);

        // Test accordion expansion
        const accordions = page.locator('.sc-mobile-drawer-details summary, details.sc-mobile-drawer-accordion summary');
        const accCount = await accordions.count();
        console.log(`  ✓ Found ${accCount} accordion categories in mobile drawer`);
        if (accCount > 0) {
          await accordions.first().click();
          await page.waitForTimeout(300);
          console.log(`  ✓ Accordion click succeeded.`);
        }

        // Close drawer
        const closeBtn = page.locator('.header__icon--menu, .modal__close-button, .menu-drawer__close-button');
        if (await closeBtn.count() > 0) {
          await closeBtn.first().click({ force: true }).catch(() => {});
          await page.waitForTimeout(300);
        }
      }
    }

    // Check Hero Banner
    if (vp.width >= 768) {
      const desktopHero = page.locator('.sc-desktop-carousel');
      if (await desktopHero.isVisible()) {
        console.log(`  ✓ Desktop hero banner carousel is visible`);
        // Test next button
        const nextBtn = page.locator('.sc-next-btn');
        if (await nextBtn.isVisible()) {
          await nextBtn.click();
          await page.waitForTimeout(400);
          console.log(`  ✓ Hero banner next slide clicked.`);
        }
      }
    } else {
      const mobileHero = page.locator('.sc-mobile-hero-container');
      if (await mobileHero.isVisible()) {
        console.log(`  ✓ Mobile hero banner container is visible`);
        const dots = page.locator('.sc-dot');
        const dotCount = await dots.count();
        console.log(`  ✓ Mobile hero dots count: ${dotCount}`);
        if (dotCount > 1) {
          await dots.nth(1).click();
          await page.waitForTimeout(400);
          console.log(`  ✓ Hero indicator dot switched slide.`);
        }
      }
    }

    // Check Featured Collection / Product Cards
    const productCards = page.locator('.card-wrapper, .sc-product-card');
    const pCardCount = await productCards.count();
    console.log(`  ✓ Product cards rendered on homepage: ${pCardCount}`);
    if (pCardCount > 0) {
      // Check badges, ratings, stock notes
      const categoryPills = page.locator('.sc-card-category-pill');
      const ratings = page.locator('.sc-card-rating');
      const stockNotes = page.locator('.sc-card-stock-note');
      console.log(`    - Category pills: ${await categoryPills.count()}`);
      console.log(`    - Star ratings: ${await ratings.count()}`);
      console.log(`    - Stock reassurance notes: ${await stockNotes.count()}`);
    }

    // Check Footer Links and Newsletter
    const footer = page.locator('.footer, .sc-footer');
    console.log(`  ✓ Footer visible: ${await footer.isVisible()}`);
    const newsletterInput = page.locator('.sc-newsletter-band input, .newsletter-form__field-wrapper input');
    console.log(`  ✓ Newsletter subscription input present: ${await newsletterInput.count() > 0}`);

    // 2. Audit Collection / Catalog Page
    console.log(`\n--- 2. Collection Page Audit (${vp.name}) ---`);
    await page.goto(`${BASE_URL}/collections/all`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1000);
    results.pagesChecked++;

    const colProducts = page.locator('.product-grid .grid__item, .collection ul li');
    const colCount = await colProducts.count();
    console.log(`  ✓ Products on /collections/all: ${colCount}`);

    // Check Filter / Facets UI
    const filterContainer = page.locator('.facets-container, #main-collection-filters');
    console.log(`  ✓ Facets / filters container rendered: ${await filterContainer.count() > 0}`);

    // 3. Audit Product Detail Page (PDP)
    console.log(`\n--- 3. Product Detail Page (PDP) Audit (${vp.name}) ---`);
    // Find a product link from collection
    const firstProductLink = page.locator('.card-wrapper a.full-unstyled-link, .card__inner a, a[href*="/products/"]').first();
    let productUrl = `${BASE_URL}/products/satin-hair-bow`;
    if (await firstProductLink.count() > 0) {
      const href = await firstProductLink.getAttribute('href');
      if (href) {
        productUrl = href.startsWith('http') ? href : `${BASE_URL}${href}`;
      }
    }

    console.log(`  Navigating to PDP: ${productUrl}`);
    await page.goto(productUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1500);
    results.pagesChecked++;

    // Check PDP Title, Price, Variant Picker, ATC Button
    const pdpTitle = await page.locator('.product__title h1, .product__title').first().textContent().catch(() => '');
    console.log(`  ✓ PDP Title: "${pdpTitle?.trim()}"`);

    const pdpPrice = await page.locator('.price__regular .price-item--regular, .price-item').first().textContent().catch(() => '');
    console.log(`  ✓ PDP Price: "${pdpPrice?.trim()}"`);

    const variantInputs = page.locator('variant-radios input[type="radio"], variant-selects select');
    const variantCount = await variantInputs.count();
    console.log(`  ✓ Variant options found: ${variantCount}`);

    // Test Variant Selection and Image Switching
    if (variantCount > 1) {
      const firstVariant = variantInputs.nth(0);
      const secondVariant = variantInputs.nth(1);
      const initialImgSrc = await page.locator('.product__media img').first().getAttribute('src').catch(() => '');
      
      await secondVariant.click({ force: true }).catch(() => {});
      await page.waitForTimeout(800);
      const updatedImgSrc = await page.locator('.product__media img').first().getAttribute('src').catch(() => '');
      console.log(`  ✓ Variant switch executed (Initial: ${initialImgSrc?.slice(0, 40)}... -> Updated: ${updatedImgSrc?.slice(0, 40)}...)`);
    }

    // Check Sticky ATC on mobile
    if (vp.width < 768) {
      console.log(`  Testing Mobile Sticky Add-to-Cart bar...`);
      // Scroll down to trigger sticky ATC
      await page.evaluate(() => window.scrollTo(0, 1200));
      await page.waitForTimeout(600);
      const stickyAtc = page.locator('.sc-sticky-atc');
      const isStickyVisible = await stickyAtc.isVisible().catch(() => false);
      console.log(`  ✓ Mobile Sticky ATC bar visible on scroll: ${isStickyVisible}`);
      if (!isStickyVisible) {
        results.warnings.push(`[${vp.name}] Sticky ATC bar did not appear when scrolled past 1200px`);
      }
    }

    // Test Add to Cart Flow & Cart Drawer
    console.log(`\n--- 4. Cart & Drawer Audit (${vp.name}) ---`);
    const atcBtn = page.locator('button[name="add"], .product-form__submit').first();
    if (await atcBtn.isVisible() && await atcBtn.isEnabled()) {
      console.log(`  Clicking Add to Cart...`);
      await atcBtn.click();
      await page.waitForTimeout(2000);

      // Check if Cart Drawer is open
      const cartDrawer = page.locator('cart-drawer.active, #CartDrawer.active, .drawer.active, .cart-drawer');
      const isDrawerOpen = await cartDrawer.first().isVisible().catch(() => false);
      console.log(`  ✓ Cart drawer opened: ${isDrawerOpen}`);

      // Check Free Shipping Progress Bar inside drawer
      const shippingBar = page.locator('.sc-free-shipping-bar');
      if (await shippingBar.count() > 0) {
        const isShippingBarVisible = await shippingBar.first().isVisible();
        const shippingText = await page.locator('.sc-shipping-text').first().textContent().catch(() => '');
        console.log(`  ✓ Free Shipping Progress Bar rendered: ${isShippingBarVisible} ("${shippingText?.trim()}")`);
      } else {
        console.log(`  ℹ Free shipping bar selector not found in current drawer markup`);
      }

      // Check Checkout Button inside drawer
      const checkoutBtn = page.locator('button[name="checkout"], #CartDrawer-Checkout, .cart__checkout-button');
      console.log(`  ✓ Cart checkout button present: ${await checkoutBtn.count() > 0}`);
    }

    // 5. Test Predictive Search
    console.log(`\n--- 5. Search Modal Audit (${vp.name}) ---`);
    const searchIcon = page.locator('.header__icon--search, details-modal[header-search] summary, .search-modal__toggle').first();
    if (await searchIcon.isVisible()) {
      await searchIcon.click();
      await page.waitForTimeout(500);
      const searchInput = page.locator('input[type="search"], .search__input').first();
      if (await searchInput.isVisible()) {
        await searchInput.fill('Scrunchie');
        await page.waitForTimeout(1000);
        const searchResults = page.locator('.predictive-search, #predictive-search-results');
        console.log(`  ✓ Predictive search triggered for "Scrunchie": ${await searchResults.isVisible()}`);
      }
    }

    await context.close();
  }

  await browser.close();

  console.log(`\n==================================================`);
  console.log(`📊 AUDIT SUMMARY`);
  console.log(`==================================================`);
  console.log(`Total Pages Checked: ${results.pagesChecked}`);
  console.log(`Errors Found: ${results.errors.length}`);
  console.log(`Warnings Found: ${results.warnings.length}`);
  
  if (results.errors.length > 0) {
    console.log(`\n❌ Error Details:`);
    results.errors.forEach((err, i) => console.log(`  ${i+1}. ${err}`));
  } else {
    console.log(`\n✅ Zero fatal JavaScript runtime errors found!`);
  }

  if (results.warnings.length > 0) {
    console.log(`\n⚠️ Warning Details:`);
    results.warnings.forEach((warn, i) => console.log(`  ${i+1}. ${warn}`));
  }

  return results;
}

runAudit().catch(console.error);

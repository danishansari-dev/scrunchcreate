# Scrunch & Create — Shopify Launch Checklist & Next Steps

> **Store:** [scrunchcreate.myshopify.com](https://scrunchcreate.myshopify.com/)  
> **Theme:** `test-data` (Dawn Customized for Scrunch & Create)  
> **Target Domain:** `scrunchcreate.com`  
> **Target Launch Date:** Immediate / Ready for Go-Live  
> **Document Purpose:** Step-by-step master checklist and operational guide for transitioning from development to live customer sales.

---

## Quick Navigation

- [1. Technical & Theme Verification Status](#1-technical--theme-verification-status)
- [2. Phase 1: Payment Gateway Setup (India Focus)](#2-phase-1-payment-gateway-setup-india-focus)
- [3. Phase 2: Shipping, Logistics & Packaging](#3-phase-2-shipping-logistics--packaging)
- [4. Phase 3: Shopify Admin Settings & Legal Policies](#4-phase-3-shopify-admin-settings--legal-policies)
- [5. Phase 4: Customer Notifications & WhatsApp Setup](#5-phase-4-customer-notifications--whatsapp-setup)
- [6. Phase 5: Discounts, Coupons & Promotions](#6-phase-5-discounts-coupons--promotions)
- [7. Phase 6: Custom Domain & DNS Cutover](#7-phase-6-custom-domain--dns-cutover)
- [8. Phase 7: Analytics, Tracking & SEO Verification](#8-phase-7-analytics-tracking--seo-verification)
- [9. Phase 8: Final Pre-Launch Smoke Testing](#9-phase-8-final-pre-launch-smoke-testing)
- [10. Post-Launch Operations & Maintenance](#10-post-launch-operations--maintenance)

---

## 1. Technical & Theme Verification Status

The storefront theme development is complete, tested, and deployed live.

| Component | Status | Notes |
| :--- | :---: | :--- |
| **Theme Code Quality** | ✅ PASS | `0` errors across 172 files in Shopify Theme Check. |
| **Color Swatches & Image Switcher** | ✅ PASS | 46 color/style palettes with instant client-side image switching on click. |
| **Header & Mega Menu** | ✅ PASS | Unified search modal, mobile drawer, and structured categories. |
| **Cart Drawer** | ✅ PASS | Live subtotal, free shipping progress bar (₹499 threshold), and checkout link. |
| **Policy Hub & 404 Routing** | ✅ PASS | Interactive 5-tab policy center with automatic fallback on 404 links. |
| **Footer & Instagram Preview** | ✅ PASS | Direct high-res CDN images linking to @scrunch_and_create with WhatsApp CTA. |
| **Responsive Layout** | ✅ PASS | Mobile, tablet, and desktop viewports verified with 0 horizontal overflow. |

---

## 2. Phase 1: Payment Gateway Setup (India Focus)

Shopify requires an active payment gateway to process real payments in Indian Rupees (INR).

- [ ] **1.1 Install Razorpay / PhonePe / Cashfree for Shopify**
  - Go to **Shopify Admin > Settings > Payments**.
  - Under **Supported payment methods**, click **Add payment methods** > **Search by provider** > Select **Razorpay** (or PhonePe / Cashfree).
  - Connect your Razorpay Live API Keys (`Key ID` and `Key Secret`).
  - Enable payment methods: **UPI (Google Pay, PhonePe, Paytm, BHIM)**, **Credit/Debit Cards (Visa, Mastercard, RuPay)**, **Net Banking**, and **Wallets**.

- [ ] **1.2 Configure Cash on Delivery (COD)**
  - Under **Manual payment methods**, enable **Cash on Delivery (COD)** if offering offline payments.
  - Optional: Install a COD verification app (e.g. *Kwikpass* or *Shiprocket Checkout*) to reduce RTO (Return to Origin) by verifying mobile numbers via OTP.

- [ ] **1.3 Test Live Payment Transaction**
  - Place a test order of ₹1–₹10 with UPI.
  - Verify that payment status changes to **Paid** and money reflects in gateway dashboard.
  - Issue a test refund to verify refund API functionality.

---

## 3. Phase 2: Shipping, Logistics & Packaging

Ensure shipping rates and automated fulfillment pipelines are established.

- [ ] **2.1 Configure Shipping Zones & Rates**
  - Go to **Shopify Admin > Settings > Shipping and delivery**.
  - **Domestic Zone (All India):**
    - **Free Shipping:** Minimum order price `₹499.00` → Price: `₹0.00` (matches theme drawer).
    - **Standard Shipping:** Order price `₹0.00 – ₹498.99` → Price: `₹49.00` (or `₹50.00`).
    - **Express Delivery (Optional):** Fixed price `₹99.00` (2–3 day transit).

- [ ] **2.2 Connect 3PL / Courier Logistics Partner**
  - Install **Shiprocket**, **Delhivery**, or **Pickrr** Shopify App.
  - Configure pickup address (origin warehouse/workshop location and pincode).
  - Test auto-sync of orders from Shopify to Shiprocket/Delhivery for automatic AWB generation and label printing.

- [ ] **2.3 Package Dimensions & Weights**
  - Under **Shipping and delivery > Saved packages**, add default package size:
    - Custom Box / Polybag: `15 cm x 15 cm x 5 cm`, Tare weight: `50 g`.

---

## 4. Phase 3: Shopify Admin Settings & Legal Policies

Shopify native checkout references the Admin policy settings during checkout steps.

- [ ] **3.1 Populate Shopify Admin Policies**
  - Go to **Shopify Admin > Settings > Policies**.
  - Paste your legal text into the following fields (content is already created in `snippets/scrunch-policy.liquid`):
    - [ ] **Refund Policy** (7-day replacement for damaged/defective items with unboxing video).
    - [ ] **Privacy Policy** (Data protection, SSL encryption, customer privacy).
    - [ ] **Terms of Service** (Store terms, pricing, handmade product disclosures).
    - [ ] **Shipping Policy** (Dispatch within 24–48 hours, delivery in 2–5 business days).
    - [ ] **Contact Information** (WhatsApp +91 80970 82798, support@scrunchcreate.com).

- [ ] **3.2 Configure Store Details**
  - Go to **Shopify Admin > Settings > General**.
  - Verify **Store currency** is `INR (₹)`.
  - Verify **Timezone** is `(GMT+05:30) Mumbai, New Delhi, India Standard Time`.
  - Verify **Order ID prefix/suffix** (e.g. `#SC1001`).

---

## 5. Phase 4: Customer Notifications & WhatsApp Setup

Automate real-time communications to maximize customer trust.

- [ ] **4.1 Brand Notification Emails**
  - Go to **Shopify Admin > Settings > Notifications > Customer notifications**.
  - Click **Customize email templates**:
    - Upload brand logo (Scrunch & Create).
    - Set accent color: `#e78592`.
    - Check templates: **Order Confirmation**, **Shipping Confirmation**, **Out for Delivery**, **Delivered**, and **Abandoned Checkout**.

- [ ] **4.2 Set Up WhatsApp Notifications & Support**
  - Install a WhatsApp automation app (*BiteSpeed*, *Wati*, *Interakt*, or *AiSensy*).
  - Configure automated WhatsApp messages for:
    - Order Confirmation with order summary.
    - Tracking link when order is shipped.
    - Abandoned Cart reminder (sent 1–2 hours after drop-off with 10% discount).

---

## 6. Phase 5: Discounts, Coupons & Promotions

Replicate the promotional coupon codes from the original store.

- [ ] **5.1 Create Active Discount Codes**
  - Go to **Shopify Admin > Discounts**.
  - [ ] `WELCOME10` — 10% off for first-time orders (minimum purchase ₹299).
  - [ ] `SCRUNCH15` — 15% off on orders above ₹799.
  - [ ] `FREESHIP` — Free shipping code (automatic or code-based).

- [ ] **5.2 Verify Automatic Cart Promotions**
  - Verify that when cart reaches `₹499`, the progress bar in the Cart Drawer shows *"You've unlocked Free Shipping!"*.

---

## 7. Phase 6: Custom Domain & DNS Cutover

Point `scrunchcreate.com` to your live Shopify store.

- [ ] **6.1 Add Domain to Shopify**
  - Go to **Shopify Admin > Settings > Domains**.
  - Click **Connect existing domain** and enter `scrunchcreate.com`.

- [ ] **6.2 Update DNS Records (at your DNS provider - GoDaddy / Namecheap / Cloudflare)**
  - Set **A Record**:
    - Host / Name: `@`
    - Points to: `23.227.38.65`
    - TTL: `Auto` or `300`
  - Set **CNAME Record**:
    - Host / Name: `www`
    - Points to: `shops.myshopify.com`
    - TTL: `Auto` or `300`

- [ ] **6.3 Verify SSL & Primary Domain**
  - In Shopify Admin > Domains, click **Verify connection**.
  - Set `scrunchcreate.com` as the **Primary domain** (with automatic redirection from `www` to root).
  - Wait for SSL certificate status to change to **Active** (usually 15–30 minutes).

---

## 8. Phase 7: Analytics, Tracking & SEO Verification

Ensure all traffic, conversions, and ad metrics are tracked accurately.

- [ ] **7.1 Google Analytics 4 (GA4) & Google Search Console**
  - Install the official **Google & YouTube app** on Shopify.
  - Connect your Google Analytics 4 Measurement ID (`G-XXXXXXXXXX`).
  - Submit your sitemap in Google Search Console: `https://scrunchcreate.com/sitemap.xml`.

- [ ] **7.2 Meta Pixel (Facebook & Instagram Ads)**
  - Install the **Facebook & Instagram app** on Shopify.
  - Connect your Meta Business Manager, Facebook Page, and Instagram Account (`@scrunch_and_create`).
  - Verify Pixel tracking for events: `PageView`, `ViewContent`, `AddToCart`, `InitiateCheckout`, and `Purchase`.

- [ ] **7.3 On-Page SEO Checklist**
  - Meta Title: *Scrunch & Create — Premium Handmade Scrunchies, Hair Bows & Accessories*
  - Meta Description: *Discover luxury satin scrunchies, elegant hair bows, floral jewellery, and gift hampers. Handcrafted in India with love. Free shipping over ₹499.*
  - Ensure OpenGraph preview image loads properly when sharing links on WhatsApp/Instagram.

---

## 9. Phase 8: Final Pre-Launch Smoke Testing

Execute this manual test sequence on desktop and mobile before unlocking the store.

- [ ] **Step 1: Homepage Navigation**
  - Test hero banner CTA buttons ("Shop Best Sellers", "Explore Collections").
  - Test mega menu category dropdowns and mobile drawer navigation.
- [ ] **Step 2: Product Swatch & Image Switching**
  - Click through colors on product cards (Classic Scrunchie, Combo Hairbow, Combo Scrunchie).
  - Verify images change instantly and selected colors stay highlighted.
- [ ] **Step 3: Cart Drawer & Thresholds**
  - Add product to cart under ₹499; verify progress bar shows remaining amount for Free Shipping.
  - Add additional items to exceed ₹499; verify Free Shipping badge unlocks.
- [ ] **Step 4: End-to-End Checkout**
  - Click **Check out** from drawer.
  - Enter test shipping address (Indian pincode, state, mobile number).
  - Verify shipping rates calculate correctly (Free over ₹499, ₹49 under ₹499).
  - Test Razorpay UPI payment or COD selection.
- [ ] **Step 5: Policy Pages Verification**
  - Click all 5 footer policy links; verify Policy Hub tabs open seamlessly without 404s.
- [ ] **Step 6: Remove Store Password**
  - Go to **Shopify Admin > Online Store > Preferences**.
  - Uncheck **Restrict access to visitors with the password**.
  - Click **Save**. The store is now live to the world! 🚀

---

## 10. Post-Launch Operations & Maintenance

- [ ] **Day 1 Monitoring:**
  - Monitor first 5 orders closely in Shopify Admin and Razorpay dashboard.
  - Confirm automated order confirmation emails and WhatsApp notifications fire immediately.
  - Check courier pickup scheduling in Shiprocket.
- [ ] **Weekly Review:**
  - Review conversion rate and cart drop-off in **Shopify Analytics > Reports**.
  - Check for any out-of-stock variants in **Inventory**.
  - Review customer queries received on WhatsApp support.

---

*Document prepared for Scrunch & Create team. Keep updated as new features and apps are added.*

# Scrunch & Create - E-commerce Frontend

A fully responsive e-commerce frontend for Scrunch & Create, a handmade scrunchies and bows brand. Built with React, Vite, and Tailwind CSS.

## 🎨 Features

- **Responsive Design**: Fully mobile-friendly with beautiful pastel theme
- **Product Catalog**: Browse scrunchies, bows, premium items, and combo packs
- **Advanced Filtering**: Filter by category, color, and search functionality
- **Shopping Cart**: Add items, manage quantities, and checkout
- **Product Details**: Multiple images, color selection, and related products
- **Contact Form**: Functional contact form with validation
- **SEO Optimized**: Meta tags and semantic HTML structure

## 🚀 Tech Stack

- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Local Storage** - Cart persistence

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd scrunch-create-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173`

## 🏗️ Project Structure

```
src/
├── components/          # Reusable components
│   ├── Navbar.jsx      # Navigation bar
│   └── Footer.jsx      # Footer component
├── pages/              # Page components
│   ├── Home.jsx        # Homepage
│   ├── Shop.jsx        # Product catalog
│   ├── ProductDetail.jsx # Individual product page
│   ├── Cart.jsx        # Shopping cart
│   ├── About.jsx       # About page
│   └── Contact.jsx     # Contact page
├── data/               # Static data
│   └── products.js     # Product data and categories
├── App.jsx             # Main app component
├── main.jsx            # Entry point
└── index.css           # Global styles
```

## 🎨 Design System

### Colors
- **Blush Pink**: `#FFB3C6` - Primary brand color
- **Lavender**: `#E6E6FA` - Secondary accent
- **Mint Green**: `#C1F4CD` - Success/positive elements
- **Beige**: `#F5F5DC` - Neutral background
- **Soft Pink**: `#FFE4E1` - Light accent
- **Light Lavender**: `#F0F0FF` - Subtle background
- **Sage**: `#BCEAD5` - Alternative green
- **Cream**: `#FFFDD0` - Warm neutral

### Typography
- **Font Family**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700, 800

## 📱 Pages Overview

### Homepage (`/`)
- Hero section with brand messaging
- Featured products showcase
- Promo banner for combo offers
- "Why choose us" section

### Shop (`/shop`)
- Product grid with filtering
- Category and color filters
- Search functionality
- Sort options (price, popularity, new)

### Product Detail (`/product/:id`)
- Image gallery with thumbnails
- Product information and pricing
- Color selection
- Quantity selector
- Related products

### Cart (Drawer)
- Shopping cart with item management
- Quantity controls
- Total calculation
- Checkout button (placeholder)

### About (`/about`)
- Brand story and values
- Team information
- Journey timeline
- Call-to-action sections

### Contact (`/contact`)
- Contact form with validation
- Contact information
- Social media links
- FAQ section

## 🛍️ Product Data Structure

```javascript
{
  id: 1,
  name: "Product Name",
  category: "scrunchies|bows|premium|combos",
  price: 299,
  originalPrice: 399, // for sale items
  colors: ["blush-pink", "lavender"],
  images: ["url1", "url2"],
  description: "Product description",
  material: "100% Silk",
  size: "One Size Fits All",
  inStock: true,
  featured: true,
  tags: ["silk", "premium"]
}
```

## 🔧 Customization

### Adding Products
Edit `src/data/products.js` to add new products:

```javascript
{
  id: 9,
  name: "New Product",
  category: "scrunchies",
  price: 199,
  colors: ["blush-pink"],
  images: ["image-url"],
  description: "Product description",
  material: "100% Cotton",
  size: "One Size Fits All",
  inStock: true,
  featured: false,
  tags: ["cotton", "new"]
}
```

### Styling
- Modify `tailwind.config.js` for color changes
- Update `src/index.css` for custom component styles
- Use Tailwind utility classes for layout changes

### Images
Replace placeholder images with your actual product photos:
- Update image URLs in `products.js`
- Use consistent aspect ratios (1:1 recommended)
- Optimize images for web (compress, resize)

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy Options
- **Vercel**: Connect GitHub repository for automatic deployment
- **Netlify**: Drag and drop `dist` folder
- **GitHub Pages**: Use GitHub Actions for deployment
- **Firebase Hosting**: Use Firebase CLI

## 🔌 Backend Integration

This is a frontend-only implementation. To integrate with a backend:

1. **Replace dummy data** with API calls
2. **Add authentication** for user accounts
3. **Integrate payment gateway** (Stripe, Razorpay)
4. **Add order management** system
5. **Implement inventory tracking**

## 📄 License

This project is created for Scrunch & Create brand. Customize and use as needed.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request


## ✉️ Contact

For any questions, feedback, or collaboration opportunities, please feel free to reach out at:  
📧 **[danishansari.dev@gmail.com](mailto:danishansari.dev@gmail.com)**

**Made with ❤️ for Scrunch & Create**

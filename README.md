# 🎀 Scrunch & Create - E-commerce Platform

A modern, fully responsive e-commerce application for **Scrunch & Create**, a boutique brand specializing in handmade scrunchies and decorative hair bows. Built with React, Vite, and styled with modern CSS Modules.

## 🌐 Live Website

**[https://scrunchcreate.com/](https://scrunchcreate.com/)**

---


## ✨ Features

- **🛍️ Product Catalog**: Browse an extensive collection of handmade scrunchies and hair bows
  - Scrunchies (various styles including Tulip Scrunchies)
  - Hair Bows (Satin, Velvet, Sheer Satin, Jimmi Choo, and more)

- **🛒 Smart Shopping Cart**:
  - Add/remove items with ease
  - Cart persistence using context
  - Real-time quantity management

- **📱 Fully Responsive Design**: Optimized for mobile, tablet, and desktop devices

- **🔍 Advanced Filtering**: Filter products by category and type

- **⚡ Toast Notifications**: Real-time user feedback for actions

- **🚀 Fast Performance**: Built with Vite for lightning-fast load times

## ️ Tech Stack

- **Frontend Framework**: React 19
- **Build Tool**: Vite 7
- **Styling**: CSS Modules
- **Routing**: React Router DOM 7
- **Animation**: Framer Motion 12
- **State Management**: React Context API
- **Package Manager**: npm
- **Hosting**: Hostinger

## 📦 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/danishansari-dev/scrunchcreate.git
   cd scrunchcreate
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   The application will open at `http://localhost:5173`

4. **Build for production**
   ```bash
   npm run build
   ```

5. **Preview production build**
   ```bash
   npm run preview
   ```

## 🏗️ Project Structure

```
scrunchcreate/
├── src/
│   ├── components/                # Reusable components
│   │   ├── NavBar.jsx
│   │   ├── Banner.jsx
│   │   ├── Footer.jsx
│   │   ├── ProductList.jsx
│   │   ├── FilterSidebar.jsx
│   │   ├── CartDrawer.jsx         # Cart UI & Context
│   │   ├── ToastContext.jsx       # Toast notification context
│   │   └── ...                    # Other components
│   │
│   ├── context/                   # Global state context
│   │   ├── AuthContext.jsx
│   │   └── WishlistContext.jsx
│   │
│   ├── pages/                     # Page components
│   │   ├── home/                  # Home page
│   │   ├── products/              # Products listing page
│   │   ├── cart/                  # Shopping cart page
│   │   └── checkout/              # Checkout & order success
│   │
│   ├── data/
│   │   └── products.json          # Product catalog data
│   │
│   ├── App.jsx                    # Main application component
│   ├── App.css                    # Global styles
│   ├── index.css                  # Base styles
│   └── main.jsx                   # Entry point
│
├── public/                        # Public assets
│   ├── assets/
│   │   └── products/              # Product images
│   │       ├── Hairbows/
│   │       └── Scrunchies/
│   ├── logotitle.png              # Logo variations
│   └── _redirects                 # SPA redirect rules
│
├── package.json                   # Project dependencies
├── vite.config.js                 # Vite configuration
├── eslint.config.js               # ESLint rules
└── index.html                     # HTML entry point
```

## 🎯 Key Components

### Navigation & Layout
- **NavBar**: Main navigation with branding and menu
- **Banner**: Hero section with product showcases
- **Footer**: Contact and company information

### Product Management
- **ProductList**: Displays products with images and details
- **FilterSidebar**: Advanced filtering options
- **CartDrawer**: Shopping cart slide-out
- **products.json**: Product catalog data (in `src/data/`)

### User Features
- **Cart**: Shopping cart functionality with context API
- **Toast Notifications**: Real-time feedback system

## 🎨 Styling

The project uses **CSS Modules** for component-scoped styling, ensuring:
- No CSS conflicts
- Easy component maintenance
- Responsive design with mobile-first approach

## 🚀 Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

## 🛍️ Product Categories

### Hair Bows
- **Jimmi Choo Hair Bow** - Premium luxury bow
- **Satin Hair Bow** - Classic elegance
- **Scarf Hairbow** - Stylish scarf bow
- **Satin Tulip Hairbow** - Delicate and sophisticated
- **Sheer Satin Hair Bow** - Light and airy
- **Velvet Hair Bow** - Soft velvet texture

### Scrunchies
- **Standard Scrunchies** - Variety of colors and styles
- **Tulip Scrunchie** - Unique petal-shaped design

## 📄 Pages Overview

### Home Page (`/`)
- Hero banner with product showcase
- Featured products and collections
- Brand highlights and promotions

### Products Page (`/products`)
- Complete product catalog
- Advanced filtering by category
- Product grid with pricing
- Add to cart functionality

### Shopping Cart (`/cart`)
- View cart items
- Manage quantities
- Calculate totals
- Proceed to checkout

### Contact (`/contact`)
- Contact form with validation
- Contact information
- Social media links

## 🛍️ Product Data Structure

The product data is stored in `src/data/products.json` and follows this structure:

```json
{
  "id": 1,
  "name": "Product Name",
  "category": "scrunchies|bows",
  "price": 299,
  "originalPrice": 399,
  "colors": ["blush-pink", "lavender"],
  "images": ["/assets/products/.../image.avif"],
  "description": "Product description",
  "material": "100% Silk",
  "size": "One Size Fits All",
  "inStock": true,
  "featured": true,
  "tags": ["silk", "premium"]
}
```

## 🔧 Adding Products

Edit `src/data/products.json` to add new products. Ensure you add valid JSON objects.

```json
{
  "id": 9,
  "name": "New Product",
  "category": "scrunchies",
  "price": 199,
  "colors": ["blush-pink"],
  "images": ["/assets/products/..."],
  "description": "Product description",
  "material": "100% Cotton",
  "size": "One Size Fits All",
  "inStock": true,
  "featured": false,
  "tags": ["cotton", "new"]
}
```

## 🚀 Deployment

This project is deployed on **[Hostinger](https://scrunchcreate.com/)**.

### Build for Production
```bash
npm run build
```
Upload the contents of the `dist/` folder to Hostinger via File Manager or FTP.

> **Note:** If updated images don't appear after redeployment, clear your browser cache (`Ctrl + Shift + R`) or purge the Hostinger cache from the control panel.

## 🔄 CI/CD Pipeline (Academic Project)

**Note:** This is a simplified CI/CD setup for academic/demo purposes only.

This project includes a basic **automated CI/CD pipeline** using Jenkins and Docker.

### Pipeline Stages

1. **Checkout** - Clone repository from GitHub
2. **Environment Setup** - Verify Node.js, npm, and Docker versions
3. **Install Dependencies** - Install npm packages
4. **Lint** - Code quality checks with ESLint
5. **Build** - Compile React application with Vite
6. **Test** - Placeholder for tests
7. **Build Docker Image** - Create Docker container image
8. **Deploy to Localhost** - Deploy to localhost:4173

### DevOps Layout
```
devops/
├── Jenkinsfile
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
└── docs/
    └── CI_CD_SETUP_GUIDE.md
```

### Quick Start

#### Build Docker Image
```bash
docker build -f devops/docker/Dockerfile -t scrunchcreate:latest .
```

#### Run with Docker Compose
```bash
docker-compose -f devops/docker/docker-compose.yml up -d --build
```

#### Access Application
- **URL**: http://localhost:4173

## 📄 License

This project is private and for Scrunch & Create brand use only.

## ✉️ Contact

For any questions, feedback, or collaboration opportunities, please feel free to reach out at:  
📧 **[danishansari.dev@gmail.com](mailto:danishansari.dev@gmail.com)**

**Made with ❤️ for Scrunch & Create**

# 🎀 Scrunch & Create - Cloud-Native E-commerce Platform

A modern, fully responsive cloud-native e-commerce application for **Scrunch & Create**, a boutique brand specializing in handmade scrunchies and decorative hair bows. Built with React, Node.js, Express, and MongoDB.

## 🌐 Live Website

- **Frontend (Vercel)**: [https://scrunchcreate.vercel.app](https://scrunchcreate.vercel.app)
- **Backend API (Render)**: [https://scrunchcreate.onrender.com/api](https://scrunchcreate.onrender.com/api)

---

## ✨ Features

- **🛍️ Dynamic Product Catalog**: Browse an extensive collection of handmade scrunchies and hair bows.
- **🔐 Secure Authentication**: JWT-based stateless authentication with hashed passwords (bcrypt).
- **🛒 Smart Shopping Cart**: Add/remove items with ease using React Context and MongoDB-backed persistence.
- **📱 Fully Responsive Design**: Optimized for mobile, tablet, and desktop devices.
- **🔍 Advanced Filtering**: Filter products by category and type.
- **⚡ Offline Fallback**: Frontend gracefully falls back to cached catalogs if the backend experiences cold starts.
- **🚀 Fast Performance**: Built with Vite and served via Vercel Edge Network. Cloudinary CDN for all product images.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite 7
- **Styling**: CSS Modules
- **Routing**: React Router DOM 7
- **State Management**: React Context API
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js
- **Framework**: Express
- **Database**: MongoDB Atlas
- **ODM**: Mongoose
- **Authentication**: JWT & bcryptjs
- **Media**: Cloudinary CDN

## 📦 Installation & Setup

### Prerequisites
- Node.js (v20+ recommended)
- MongoDB Atlas cluster (free tier is fine)
- Cloudinary account

### Step-by-Step

1. **Clone the repository**
   ```bash
   git clone https://github.com/danishansari-dev/scrunchcreate.git
   cd scrunchcreate
   ```

2. **Configure Backend Environment**
   ```bash
   cp backend/.env.example backend/.env
   ```
   Fill in your `.env` values (MongoDB URI, JWT Secret). The file `backend/.env.example` documents all keys.

3. **Configure Frontend Environment**
   ```bash
   cp .env.example .env
   ```
   The default backend URL (`http://localhost:5000/api`) works out of the box for local development.

4. **Start the Backend**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

5. **Start the Frontend (New Terminal)**
   ```bash
   npm install
   npm run dev
   ```
   The application will automatically open at `http://localhost:5173`.

## 🏗️ Project Structure

```text
scrunchcreate/
├── backend/                       # Express REST API
│   ├── scripts/                   # DB seeding and migration scripts
│   ├── src/
│   │   ├── config/                # DB connection and Passport config
│   │   ├── controllers/           # Route logic (Auth, Cart, Orders, Products)
│   │   ├── middleware/            # JWT validation, Role auth, Error handling
│   │   ├── models/                # Mongoose schemas (User, Product, Cart, Order)
│   │   └── routes/                # Express API routes
│   └── server.js                  # Backend entry point
│
├── src/                           # React Frontend
│   ├── components/                # Reusable UI components
│   ├── context/                   # Global state (Auth, Cart, Toast)
│   ├── pages/                     # Page components
│   ├── services/                  # API client (Axios)
│   ├── utils/                     # Helpers (Pricing, Colors, Offline fallback)
│   └── App.jsx                    # Main application
```

## 🚀 Deployment

The project features a fully automated CI/CD pipeline integrated directly with GitHub.

- **Frontend**: Deploys automatically to **Vercel** on every push to the `main` branch.
- **Backend**: Deploys automatically to **Render** on every push to the `main` branch.

Environment variables for production must be secured within the Vercel and Render infrastructure dashboards respectively.

## 📄 License

This project is private and for Scrunch & Create brand use only.

## ✉️ Contact

For any questions, feedback, or collaboration opportunities, please feel free to reach out at:  
📧 **[danishansari.dev@gmail.com](mailto:danishansari.dev@gmail.com)**

**Made with ❤️ for Scrunch & Create**

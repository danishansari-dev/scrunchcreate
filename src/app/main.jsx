import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter as Router } from 'react-router-dom'
import { CartProvider } from '../features/cart/context/CartContext'
import { ToastProvider } from '../components/ToastContext'
import { WishlistProvider } from '../features/wishlist/context/WishlistContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <ToastProvider>
        <WishlistProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </WishlistProvider>
      </ToastProvider>
    </Router>
  </StrictMode>,
)


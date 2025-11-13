import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter as Router } from 'react-router-dom'
import { CartProvider } from './componets/cart/CartContext'
import { ToastProvider } from './componets/toast/ToastContext'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
       <CartProvider>
         <ToastProvider>
           <App />
         </ToastProvider>
       </CartProvider>
    </Router>
  </StrictMode>,
)

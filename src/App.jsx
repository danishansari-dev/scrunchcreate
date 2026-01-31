import React from 'react'
import Home from './pages/home/Home'
import Products from './pages/products/Products'
import { Routes, Route } from 'react-router-dom'
import SignIn from './pages/auth/SignIn'
import SignUp from './pages/auth/SignUp'
import Profile from './pages/profile/Profile'
import Cart from './pages/cart/Cart'
import Wishlist from './pages/wishlist/Wishlist'
import ProductDetail from './pages/product/ProductDetail'
import PrivacyPolicy from './pages/legal/PrivacyPolicy'
import TermsAndConditions from './pages/legal/TermsAndConditions'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Checkout from './pages/checkout/Checkout'
import OrderSuccess from './pages/checkout/OrderSuccess'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path='/' element={<Home />} />
        <Route path='/products' element={<Products />} />
        <Route path='/products/:category' element={<Products />} />
        <Route path='/product/:slug' element={<ProductDetail />} />
        <Route path='/signin' element={<SignIn />} />
        <Route path='/signup' element={<SignUp />} />
        <Route
          path='/profile'
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path='/cart' element={<Cart />} />
        <Route path='/wishlist' element={<Wishlist />} />
        <Route path='/checkout' element={<Checkout />} />
        <Route path='/order-success' element={<OrderSuccess />} />
        <Route path='/privacy-policy' element={<PrivacyPolicy />} />
        <Route path='/terms-and-conditions' element={<TermsAndConditions />} />
      </Route>
    </Routes>
  )
}

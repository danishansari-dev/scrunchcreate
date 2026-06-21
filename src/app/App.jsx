import { Routes, Route } from 'react-router-dom'
import Home from '../pages/home/Home'
import Products from '../pages/products/Products'
import Cart from '../pages/cart/Cart'
import Wishlist from '../pages/wishlist/Wishlist'
import ProductDetail from '../pages/product/ProductDetail'
import PrivacyPolicy from '../pages/legal/PrivacyPolicy'
import TermsAndConditions from '../pages/legal/TermsAndConditions'
import Layout from '../components/Layout'
import Checkout from '../pages/checkout/Checkout'
import OrderSuccess from '../pages/checkout/OrderSuccess'
import AuthPage from '../pages/auth/AuthPage'
import ProfilePage from '../pages/profile/ProfilePage'
import NotFound from '../pages/NotFound'
import AdminDashboard from '../pages/admin/AdminDashboard'
import { AdminGuard } from '../features/auth/components/AdminGuard/AdminGuard'

export default function App() {

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path='/' element={<Home />} />
        <Route path='/products' element={<Products />} />
        <Route path='/products/:category' element={<Products />} />
        <Route path='/product/:slug' element={<ProductDetail />} />
        <Route path='/cart' element={<Cart />} />
        <Route path='/wishlist' element={<Wishlist />} />
        <Route path='/checkout' element={<Checkout />} />
        <Route path='/order-success' element={<OrderSuccess />} />
        <Route path='/login' element={<AuthPage />} />
        <Route path='/profile' element={<ProfilePage />} />
        <Route path='/admin' element={<AdminGuard><AdminDashboard /></AdminGuard>} />
        <Route path='/privacy-policy' element={<PrivacyPolicy />} />
        <Route path='/terms-and-conditions' element={<TermsAndConditions />} />
        <Route path='*' element={<NotFound />} />
      </Route>
    </Routes>
  )
}


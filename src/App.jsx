import React from 'react'
import Home from './pages/home/Home'
import Products from './pages/products/Products'
import { Routes, Route } from 'react-router-dom'
import SignIn from './pages/auth/SignIn'
import SignUp from './pages/auth/SignUp'
import Profile from './pages/profile/Profile'
import Cart from './pages/cart/Cart'

export default function App() {
  return (
    <>
     <Routes>
       <Route path='/' element={<Home />} />
       <Route path='/products' element={<Products />} />
       <Route path='/signin' element={<SignIn />} />
       <Route path='/signup' element={<SignUp />} />
       <Route path='/profile' element={<Profile />} />
       <Route path='/cart' element={<Cart />} />
     </Routes>
   </>
  )
}

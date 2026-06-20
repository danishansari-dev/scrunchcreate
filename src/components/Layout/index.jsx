import { useLocation, Outlet } from 'react-router-dom'
// Why: Framer Motion imports may flag as unused depending on ESLint JSX configuration.
import { AnimatePresence, motion } from 'framer-motion' // eslint-disable-line no-unused-vars
import NavBar from '../NavBar'
import Footer from '../Footer'
import CartDrawer from '../../features/cart/components/CartDrawer'
import ErrorBoundary from '../ErrorBoundary'

export default function Layout() {
  const location = useLocation()

  return (
    <div className="App">
      <NavBar />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </motion.main>
      </AnimatePresence>
      <Footer />
      <CartDrawer />
    </div>
  )
}


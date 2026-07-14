import { useLocation, Outlet } from 'react-router-dom'
// Why: Framer Motion imports may flag as unused depending on ESLint JSX configuration.
import { AnimatePresence, motion } from 'framer-motion' // eslint-disable-line no-unused-vars
import NavBar from '../NavBar'
import Footer from '../Footer'
import CartDrawer from '../../features/cart/components/CartDrawer'
import ErrorBoundary from '../ErrorBoundary'

/**
 * Root layout wrapper — renders NavBar, animated page outlet, Footer, and CartDrawer.
 * Why mode="sync" instead of "wait": React Router v7's Outlet lifecycle doesn't
 * trigger Framer Motion exit callbacks reliably, causing mode="wait" to leave pages
 * stuck at initial opacity: 0 (blank screen). mode="sync" cross-fades instead.
 * initial={false} prevents the first page load from starting invisible.
 */
export default function Layout() {
  const location = useLocation()

  return (
    <div className="App">
      <NavBar />
      <AnimatePresence mode="sync" initial={false}>
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
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


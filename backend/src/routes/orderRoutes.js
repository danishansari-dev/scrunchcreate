/**
 * Order routes.
 * Protected: place an order, get own orders
 * Admin-only: get all orders, update order status
 */
const express = require('express');
const router = express.Router();

const {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/orderController');

const { protect, authorize } = require('../middleware/authMiddleware');

// All order routes require authentication
router.use(protect);

// Customer routes
router.post('/', createOrder);
router.get('/my', getMyOrders);

// Admin-only routes
router.get('/', authorize('admin'), getAllOrders);
router.put('/:id', authorize('admin'), updateOrderStatus);

module.exports = router;

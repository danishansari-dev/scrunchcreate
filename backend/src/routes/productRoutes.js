/**
 * Product routes.
 * Public: GET all / GET by id
 * Admin-only: POST / PUT / DELETE
 */
const express = require('express');
const router = express.Router();

const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');

const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin-only routes — require JWT + admin role
router.post('/', protect, authorize('admin'), createProduct);
router.put('/:id', protect, authorize('admin'), updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

module.exports = router;

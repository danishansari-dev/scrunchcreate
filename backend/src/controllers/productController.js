/**
 * Product controller.
 * Handles CRUD operations for the product catalog.
 * Public routes: getProducts, getProductById
 * Admin-only routes: createProduct, updateProduct, deleteProduct
 */
const Product = require('../models/Product');

/**
 * Fetch all products with optional query filters.
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = async (req, res) => {
  // Basic filtering by category if provided as a query param
  const filter = {};
  if (req.query.category) {
    filter.category = req.query.category;
  }

  const products = await Product.find(filter).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: products.length,
    data: products,
  });
};

/**
 * Fetch a single product by its MongoDB _id.
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProductById = async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    return next(error);
  }

  res.status(200).json({ success: true, data: product });
};

/**
 * Create a new product.
 * @route   POST /api/products
 * @access  Admin only
 */
const createProduct = async (req, res) => {
  const product = await Product.create(req.body);

  res.status(201).json({ success: true, data: product });
};

/**
 * Update an existing product by _id.
 * @route   PUT /api/products/:id
 * @access  Admin only
 */
const updateProduct = async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // return the updated document
    runValidators: true, // re-run schema validators on update
  });

  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    return next(error);
  }

  res.status(200).json({ success: true, data: product });
};

/**
 * Delete a product by _id.
 * @route   DELETE /api/products/:id
 * @access  Admin only
 */
const deleteProduct = async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    return next(error);
  }

  res.status(200).json({ success: true, message: 'Product deleted' });
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};

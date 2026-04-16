/**
 * Order controller.
 * Handles order placement and retrieval.
 * Customers can place orders and view their own;
 * admins can view all orders and update statuses.
 */
const Order = require('../models/Order');
const Product = require('../models/Product');

/**
 * Place a new order.
 * Validates that all referenced products exist and computes totalAmount
 * from the current product prices × quantities.
 * @route   POST /api/orders
 * @access  Protected
 */
const createOrder = async (req, res, next) => {
  const { items, shippingAddress } = req.body;

  if (!items || items.length === 0) {
    const error = new Error('Order must contain at least one item');
    error.statusCode = 400;
    return next(error);
  }

  if (!shippingAddress) {
    const error = new Error('Shipping address is required');
    error.statusCode = 400;
    return next(error);
  }

  // Build order items with price snapshots from the current catalog
  let totalAmount = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await Product.findById(item.productId);

    if (!product) {
      const error = new Error(`Product not found: ${item.productId}`);
      error.statusCode = 404;
      return next(error);
    }

    if (product.stock < item.quantity) {
      const error = new Error(
        `Insufficient stock for "${product.name}". Available: ${product.stock}`
      );
      error.statusCode = 400;
      return next(error);
    }

    const lineTotal = product.price * item.quantity;
    totalAmount += lineTotal;

    orderItems.push({
      productId: product._id,
      quantity: item.quantity,
      price: product.price, // snapshot at purchase time
    });

    // Decrement stock
    product.stock -= item.quantity;
    await product.save();
  }

  const order = await Order.create({
    userId: req.user._id,
    items: orderItems,
    totalAmount,
    shippingAddress,
  });

  res.status(201).json({ success: true, data: order });
};

/**
 * Get the authenticated user's orders.
 * @route   GET /api/orders/my
 * @access  Protected
 */
const getMyOrders = async (req, res) => {
  const orders = await Order.find({ userId: req.user._id })
    .populate('items.productId', 'name images')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders,
  });
};

/**
 * Get ALL orders (admin dashboard).
 * @route   GET /api/orders
 * @access  Admin only
 */
const getAllOrders = async (req, res) => {
  const orders = await Order.find()
    .populate('userId', 'name email')
    .populate('items.productId', 'name images')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders,
  });
};

/**
 * Update order status (admin action, e.g. ship / deliver / cancel).
 * @route   PUT /api/orders/:id
 * @access  Admin only
 */
const updateOrderStatus = async (req, res, next) => {
  const { status } = req.body;

  if (!status) {
    const error = new Error('Status is required');
    error.statusCode = 400;
    return next(error);
  }

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );

  if (!order) {
    const error = new Error('Order not found');
    error.statusCode = 404;
    return next(error);
  }

  res.status(200).json({ success: true, data: order });
};

module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
};

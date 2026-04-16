/**
 * Cart controller — MongoDB-backed.
 *
 * Replaces the previous in-memory Map implementation so cart data persists
 * across Render redeployments and container restarts.
 *
 * Every operation is scoped to req.user._id (set by the protect middleware).
 * The API contract (routes, response shapes) is identical to the old version.
 */
const Cart = require('../models/Cart');
const Product = require('../models/Product');

/**
 * Get the current user's cart with populated product details.
 * Uses a single populate() call instead of N+1 individual findById queries.
 * @route   GET /api/cart
 * @access  Protected
 */
const getCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate(
    'items.product'
  );

  // Return empty array if the user has no cart document yet
  const populatedItems = cart
    ? cart.items.map((item) => ({
        productId: item.product._id.toString(),
        quantity: item.quantity,
        product: item.product,
      }))
    : [];

  res.status(200).json({ success: true, data: populatedItems });
};

/**
 * Add an item to the cart or increment its quantity if already present.
 * Uses findOneAndUpdate with upsert so the cart document is created
 * automatically on the user's first add-to-cart action.
 * @route   POST /api/cart
 * @access  Protected
 * @body    { productId: string, quantity?: number }
 */
const addToCart = async (req, res, next) => {
  const { productId, quantity = 1 } = req.body;

  if (!productId) {
    const error = new Error('productId is required');
    error.statusCode = 400;
    return next(error);
  }

  // Verify the product actually exists before adding
  const product = await Product.findById(productId);
  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    return next(error);
  }

  // Try to increment quantity if the product is already in the cart
  const existingCart = await Cart.findOneAndUpdate(
    { user: req.user._id, 'items.product': productId },
    { $inc: { 'items.$.quantity': quantity } },
    { new: true }
  );

  if (!existingCart) {
    // Product wasn't in the cart yet — push a new item (upsert the cart doc)
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $push: { items: { product: productId, quantity } } },
      { new: true, upsert: true }
    );
  }

  // Return the updated cart items (un-populated, matching old response shape)
  const updatedCart = await Cart.findOne({ user: req.user._id });
  const data = updatedCart.items.map((item) => ({
    productId: item.product.toString(),
    quantity: item.quantity,
  }));

  res.status(200).json({
    success: true,
    message: 'Item added to cart',
    data,
  });
};

/**
 * Update the quantity of a specific cart item.
 * Setting quantity to 0 removes the item entirely.
 * @route   PUT /api/cart/:productId
 * @access  Protected
 * @body    { quantity: number }
 */
const updateCartItem = async (req, res, next) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  if (quantity == null || quantity < 0) {
    const error = new Error('A valid quantity is required');
    error.statusCode = 400;
    return next(error);
  }

  // Quantity 0 means the user wants to remove the item
  if (quantity === 0) {
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $pull: { items: { product: productId } } }
    );
  } else {
    const result = await Cart.findOneAndUpdate(
      { user: req.user._id, 'items.product': productId },
      { $set: { 'items.$.quantity': quantity } },
      { new: true }
    );

    if (!result) {
      const error = new Error('Item not found in cart');
      error.statusCode = 404;
      return next(error);
    }
  }

  // Return updated cart
  const updatedCart = await Cart.findOne({ user: req.user._id });
  const data = updatedCart
    ? updatedCart.items.map((item) => ({
        productId: item.product.toString(),
        quantity: item.quantity,
      }))
    : [];

  res.status(200).json({ success: true, data });
};

/**
 * Remove a specific item from the cart.
 * @route   DELETE /api/cart/:productId
 * @access  Protected
 */
const removeFromCart = async (req, res) => {
  const { productId } = req.params;

  await Cart.findOneAndUpdate(
    { user: req.user._id },
    { $pull: { items: { product: productId } } }
  );

  // Return updated cart
  const updatedCart = await Cart.findOne({ user: req.user._id });
  const data = updatedCart
    ? updatedCart.items.map((item) => ({
        productId: item.product.toString(),
        quantity: item.quantity,
      }))
    : [];

  res.status(200).json({
    success: true,
    message: 'Item removed from cart',
    data,
  });
};

/**
 * Clear the entire cart for the current user.
 * Keeps the cart document but empties the items array,
 * so the user→cart mapping stays intact for future adds.
 * @route   DELETE /api/cart
 * @access  Protected
 */
const clearCart = async (req, res) => {
  await Cart.findOneAndUpdate(
    { user: req.user._id },
    { $set: { items: [] } }
  );

  res.status(200).json({ success: true, message: 'Cart cleared', data: [] });
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};

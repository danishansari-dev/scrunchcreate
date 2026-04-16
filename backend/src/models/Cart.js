/**
 * Cart model.
 * Persists each user's shopping cart in MongoDB instead of an in-memory Map,
 * so cart data survives container restarts and redeployments on Render.
 *
 * One cart document per user (enforced via unique index on `user`).
 */
const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema(
  {
    /** Reference to the product being carted */
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Cart item must reference a product'],
    },

    /** How many of this product the user wants */
    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: [1, 'Quantity must be at least 1'],
    },
  },
  { _id: false } // No need for sub-document IDs — product ref is the key
);

const cartSchema = new mongoose.Schema(
  {
    /** Owner — one cart per user, enforced by unique index */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Cart must belong to a user'],
      unique: true,
    },

    /** Line items in the cart */
    items: [cartItemSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Cart', cartSchema);

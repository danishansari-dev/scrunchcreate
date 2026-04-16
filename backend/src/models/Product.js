/**
 * Product schema.
 * Represents a sellable item in the ScrunchCreate catalog.
 */
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    stock: {
      type: Number,
      required: [true, 'Stock count is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    /** Array of image URLs (CDN, S3, etc.) */
    images: {
      type: [String],
      default: [],
    },
    colors: {
      type: [String],
      default: [],
    },
    originalPrice: {
      type: Number,
      default: null,
    },
    discountPercent: {
      type: Number,
      default: 0,
    },
    isNew: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isNewArrival: {
      type: Boolean,
      default: false,
    },
    slug: {
      type: String,
      default: "",
    },
    variants: {
      type: [Object],
      default: [],
    },
  },
  {
    // Mongoose adds createdAt + updatedAt automatically
    timestamps: true,
    // 'isNew' is a Mongoose reserved name but we use it as a product flag
    suppressReservedKeysWarning: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

module.exports = mongoose.model('Product', productSchema);

/**
 * Why this file exists:
 * The ProductForm provides a dedicated UI slide-over to create new products
 * or update existing product details (such as names, category, description,
 * prices, and nesting variants).
 */
import { useState, useEffect } from 'react';
import { adminSaveProduct } from '../../services/api';

/**
 * ProductForm component renders input forms for catalog changes.
 * Why: Slides over to hide main screen context and focus admin on catalog entry.
 * Tricky logic: Automatically calculates discount percentage when prices change,
 * dynamically handles adding/removing variants, and normalizes array splits.
 * @danishansari-dev props - Object containing product details, onClose, and onSave callback
 * @returns Renders the catalog editor slide-over
 */
export default function ProductForm({ product, onClose, onSave }) {
  const isEdit = !!product;

  // Form input states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Scrunchie');
  const [type, setType] = useState('');
  const [color, setColor] = useState('');
  const [colorHex, setColorHex] = useState('');
  const [price, setPrice] = useState(0);
  const [offerPrice, setOfferPrice] = useState(0);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [primaryImage, setPrimaryImage] = useState('');
  const [images, setImages] = useState('');
  const [badge, setBadge] = useState('');
  const [inStock, setInStock] = useState(true);

  // Nested variants list state
  const [variants, setVariants] = useState([]);

  // Load product if editing
  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setSlug(product.slug || '');
      setDescription(product.description || '');
      setCategory(product.category || 'Scrunchie');
      setType(product.type || '');
      setColor(product.color || '');
      setColorHex(product.colorHex || '');
      setPrice(product.price || 0);
      setOfferPrice(product.offerPrice || 0);
      setDiscountPercent(product.discountPercent || 0);
      setPrimaryImage(product.primaryImage || '');
      setImages(Array.isArray(product.images) ? product.images.join(', ') : '');
      setBadge(product.badge || '');
      setInStock(product.inStock ?? true);
      setVariants(product.variants || []);
    } else {
      // Defaults for new product
      setName('');
      setSlug('');
      setDescription('');
      setCategory('Scrunchie');
      setType('');
      setColor('');
      setColorHex('');
      setPrice(0);
      setOfferPrice(0);
      setDiscountPercent(0);
      setPrimaryImage('');
      setImages('');
      setBadge('');
      setInStock(true);
      setVariants([]);
    }
  }, [product]);

  // Recalculate discount percentage when original price or offer price changes
  useEffect(() => {
    const rawPrice = Number(price);
    const rawOfferPrice = Number(offerPrice);
    if (rawPrice > 0 && rawPrice > rawOfferPrice) {
      const pct = Math.round(((rawPrice - rawOfferPrice) / rawPrice) * 100);
      setDiscountPercent(pct);
    } else {
      setDiscountPercent(0);
    }
  }, [price, offerPrice]);

  /**
   * Adds a new empty variant row to local state.
   */
  const handleAddVariant = () => {
    const newVariant = {
      id: 'var_' + Math.random().toString(36).substring(2, 9),
      slug: '',
      color: '',
      price: null,
      offerPrice: null,
      images: []
    };
    setVariants(prev => [...prev, newVariant]);
  };

  /**
   * Removes a variant from local state.
   * @danishansari-dev variantId - Unique variant ID string
   */
  const handleRemoveVariant = (variantId) => {
    setVariants(prev => prev.filter(v => v.id !== variantId));
  };

  /**
   * Updates an individual variant field in state.
   * @danishansari-dev variantId - Unique variant ID string
   * @danishansari-dev field - Target key string
   * @danishansari-dev val - New input value
   */
  const handleVariantChange = (variantId, field, val) => {
    setVariants(prev => prev.map(v => {
      if (v.id === variantId) {
        if (field === 'images') {
          // split images by comma
          return { ...v, images: val.split(',').map(img => img.trim()).filter(Boolean) };
        }
        return { ...v, [field]: val };
      }
      return v;
    }));
  };

  /**
   * Submits the form data to the save API.
   * @danishansari-dev e - React form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) return alert('Name is required');
    if (!primaryImage.trim()) return alert('Primary Image URL is required');

    const productPayload = {
      id: product?.id, // undefined for new product
      name,
      slug,
      description,
      category,
      type,
      color,
      colorHex,
      price: Number(price),
      offerPrice: Number(offerPrice),
      originalPrice: Number(price),
      discountPercent,
      primaryImage,
      images: images.split(',').map(i => i.trim()).filter(Boolean),
      badge: badge || null,
      inStock,
      variants: variants.map(v => ({
        ...v,
        price: v.price ? Number(v.price) : null,
        offerPrice: v.offerPrice ? Number(v.offerPrice) : null,
        colorHex: v.colorHex || v.color || '',
        normalizedColor: v.color ? v.color.toLowerCase().trim().replace(/[\s_]+/g, '-') : ''
      }))
    };

    // Construct available colors list
    const colorsList = new Set();
    if (color) colorsList.add(color.toLowerCase().trim().replace(/[\s_]+/g, '-'));
    variants.forEach(v => {
      if (v.color) colorsList.add(v.color.toLowerCase().trim().replace(/[\s_]+/g, '-'));
    });
    productPayload.availableColors = Array.from(colorsList);

    try {
      const saved = await adminSaveProduct(productPayload);
      onSave(saved);
    } catch (err) {
      console.error(err);
      alert('Failed to save product: ' + err.message);
    }
  };

  // Overlay component inline styles to lock focus and style the side drawer
  const overlayStyle = {
    position: 'fixed',
    top: 0,
    right: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0, 0, 0, 0.4)',
    zIndex: 1100,
    display: 'flex',
    justifyContent: 'flex-end',
    backdropFilter: 'blur(5px)',
  };

  const formDrawerStyle = {
    background: '#ffffff',
    width: 'min(90vw, 560px)',
    height: '100%',
    overflowY: 'auto',
    boxShadow: '-10px 0 30px rgba(74, 28, 64, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    animation: 'slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={formDrawerStyle} onClick={(e) => e.stopPropagation()}>
        <header style={{
          padding: '24px',
          borderBottom: '1px solid var(--color-border-soft)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--color-background-soft)'
        }}>
          <h3 style={{ margin: 0, fontFamily: 'var(--font-header)', color: 'var(--color-secondary)', fontSize: '18px' }}>
            {isEdit ? 'Edit Catalog Product' : 'Add New Product'}
          </h3>
          <button onClick={onClose} style={{
            background: 'none',
            border: 'none',
            fontSize: '20px',
            color: 'var(--color-text-muted)',
            cursor: 'pointer'
          }}>
            &times;
          </button>
        </header>

        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-secondary)' }}>Product Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Silk Tulip Scrunchie"
              style={{ padding: '10px', border: '1px solid var(--color-border-soft)', borderRadius: '6px', fontSize: '14px', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-secondary)' }}>Slug (Optional)</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="Auto-generated if empty"
                style={{ padding: '10px', border: '1px solid var(--color-border-soft)', borderRadius: '6px', fontSize: '14px', outline: 'none' }}
              />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-secondary)' }}>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ padding: '10px', border: '1px solid var(--color-border-soft)', borderRadius: '6px', fontSize: '14px', outline: 'none', background: '#fff' }}
              >
                <option value="Scrunchie">Scrunchie</option>
                <option value="HairBow">HairBow</option>
                <option value="GiftHamper">GiftHamper</option>
                <option value="FlowerJewellery">FlowerJewellery</option>
                <option value="Hairclip">Hairclip</option>
                <option value="Earring">Earring</option>
                <option value="Paraandi">Paraandi</option>
                <option value="Combo">Combo</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-secondary)' }}>Product Type</label>
              <input
                type="text"
                value={type}
                onChange={(e) => setType(e.target.value)}
                placeholder="e.g. classic, tulip, combo"
                style={{ padding: '10px', border: '1px solid var(--color-border-soft)', borderRadius: '6px', fontSize: '14px', outline: 'none' }}
              />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-secondary)' }}>Primary Color</label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="e.g. Rose Gold, Pink"
                style={{ padding: '10px', border: '1px solid var(--color-border-soft)', borderRadius: '6px', fontSize: '14px', outline: 'none' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-secondary)' }}>Color Hex/CSS Value</label>
              <input
                type="text"
                value={colorHex}
                onChange={(e) => setColorHex(e.target.value)}
                placeholder="e.g. #FFC0CB"
                style={{ padding: '10px', border: '1px solid var(--color-border-soft)', borderRadius: '6px', fontSize: '14px', outline: 'none' }}
              />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-secondary)' }}>Badge Text</label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="e.g. New, Best Seller"
                style={{ padding: '10px', border: '1px solid var(--color-border-soft)', borderRadius: '6px', fontSize: '14px', outline: 'none' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-secondary)' }}>Original Price (MRP) *</label>
              <input
                type="number"
                required
                min="0"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                style={{ padding: '10px', border: '1px solid var(--color-border-soft)', borderRadius: '6px', fontSize: '14px', outline: 'none' }}
              />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-secondary)' }}>Offer Price (Selling) *</label>
              <input
                type="number"
                required
                min="0"
                value={offerPrice}
                onChange={(e) => setOfferPrice(Number(e.target.value))}
                style={{ padding: '10px', border: '1px solid var(--color-border-soft)', borderRadius: '6px', fontSize: '14px', outline: 'none' }}
              />
            </div>
            <div style={{ width: '80px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-secondary)' }}>Savings</label>
              <div style={{ padding: '10px', border: '1px solid var(--color-border-soft)', borderRadius: '6px', fontSize: '14px', background: 'var(--color-surface-soft)', textAlign: 'center', fontWeight: '600' }}>
                {discountPercent}%
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-secondary)' }}>Primary Image URL *</label>
            <input
              type="url"
              required
              value={primaryImage}
              onChange={(e) => setPrimaryImage(e.target.value)}
              placeholder="Cloudinary/Web address"
              style={{ padding: '10px', border: '1px solid var(--color-border-soft)', borderRadius: '6px', fontSize: '14px', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-secondary)' }}>Additional Image URLs (comma-separated)</label>
            <textarea
              value={images}
              onChange={(e) => setImages(e.target.value)}
              placeholder="url1, url2, url3"
              rows="2"
              style={{ padding: '10px', border: '1px solid var(--color-border-soft)', borderRadius: '6px', fontSize: '14px', outline: 'none', fontFamily: 'inherit', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-secondary)' }}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed product information..."
              rows="3"
              style={{ padding: '10px', border: '1px solid var(--color-border-soft)', borderRadius: '6px', fontSize: '14px', outline: 'none', fontFamily: 'inherit', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              onClick={() => setInStock(prev => !prev)}
              style={{
                width: '38px',
                height: '20px',
                backgroundColor: inStock ? '#10b981' : '#e5e7eb',
                borderRadius: '999px',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                transition: 'background-color 0.2s ease',
                padding: 0
              }}
            >
              <span style={{
                width: '16px',
                height: '16px',
                backgroundColor: '#ffffff',
                borderRadius: '50%',
                position: 'absolute',
                top: '2px',
                left: '2px',
                transition: 'transform 0.2s ease',
                transform: inStock ? 'translateX(18px)' : 'translateX(0)'
              }} />
            </button>
            <span style={{ fontSize: '14px', fontWeight: '600', color: inStock ? '#059669' : '#dc2626' }}>
              {inStock ? 'List Product as In Stock' : 'List Product as Out of Stock'}
            </span>
          </div>

          {/* VARIANTS SECTION */}
          <div style={{ borderTop: '1px solid var(--color-border-soft)', paddingTop: '20px', marginTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: 'var(--color-secondary)' }}>Product Color Variants</h4>
              <button
                type="button"
                onClick={handleAddVariant}
                style={{
                  background: 'rgba(74, 28, 64, 0.06)',
                  color: 'var(--color-secondary)',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                ➕ Add Variant
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {variants.map((v) => (
                <div key={v.id} style={{
                  background: '#faf8f9',
                  border: '1px solid var(--color-border-soft)',
                  borderRadius: '8px',
                  padding: '16px',
                  position: 'relative'
                }}>
                  <button
                    type="button"
                    onClick={() => handleRemoveVariant(v.id)}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-error)',
                      fontSize: '16px',
                      cursor: 'pointer'
                    }}
                    aria-label="Remove variant"
                  >
                    &times;
                  </button>

                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 120px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--color-text-muted)' }}>Color Name *</label>
                      <input
                        type="text"
                        required
                        value={v.color}
                        onChange={(e) => handleVariantChange(v.id, 'color', e.target.value)}
                        placeholder="e.g. Navy Blue"
                        style={{ padding: '6px 10px', border: '1px solid var(--color-border-soft)', borderRadius: '4px', fontSize: '13px', outline: 'none' }}
                      />
                    </div>
                    <div style={{ flex: '1 1 100px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--color-text-muted)' }}>Color Hex/CSS</label>
                      <input
                        type="text"
                        value={v.colorHex || ''}
                        onChange={(e) => handleVariantChange(v.id, 'colorHex', e.target.value)}
                        placeholder="e.g. #000080"
                        style={{ padding: '6px 10px', border: '1px solid var(--color-border-soft)', borderRadius: '4px', fontSize: '13px', outline: 'none' }}
                      />
                    </div>
                    <div style={{ flex: '1 1 80px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--color-text-muted)' }}>Price (MRP)</label>
                      <input
                        type="number"
                        value={v.price || ''}
                        onChange={(e) => handleVariantChange(v.id, 'price', e.target.value)}
                        placeholder="Use parent if empty"
                        style={{ padding: '6px 10px', border: '1px solid var(--color-border-soft)', borderRadius: '4px', fontSize: '13px', outline: 'none' }}
                      />
                    </div>
                    <div style={{ flex: '1 1 80px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--color-text-muted)' }}>Offer Price</label>
                      <input
                        type="number"
                        value={v.offerPrice || ''}
                        onChange={(e) => handleVariantChange(v.id, 'offerPrice', e.target.value)}
                        placeholder="Use parent if empty"
                        style={{ padding: '6px 10px', border: '1px solid var(--color-border-soft)', borderRadius: '4px', fontSize: '13px', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '10px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--color-text-muted)' }}>Variant Image URLs (comma-separated)</label>
                    <input
                      type="text"
                      value={Array.isArray(v.images) ? v.images.join(', ') : ''}
                      onChange={(e) => handleVariantChange(v.id, 'images', e.target.value)}
                      placeholder="url1, url2"
                      style={{ padding: '6px 10px', border: '1px solid var(--color-border-soft)', borderRadius: '4px', fontSize: '13px', outline: 'none' }}
                    />
                  </div>
                </div>
              ))}
              {variants.length === 0 && (
                <div style={{ textAlign: 'center', padding: '12px', border: '1px dashed var(--color-border-soft)', borderRadius: '8px', color: 'var(--color-text-muted)', fontSize: '13px' }}>
                  No variants added. Parent attributes will be used.
                </div>
              )}
            </div>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            borderTop: '1px solid var(--color-border-soft)',
            paddingTop: '20px',
            marginTop: '10px'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: '#ffffff',
                border: '1px solid var(--color-border-soft)',
                padding: '10px 20px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                background: 'var(--color-secondary, #4a1c40)',
                color: '#ffffff',
                border: 'none',
                padding: '10px 24px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(74, 28, 64, 0.15)'
              }}
            >
              Save Product
            </button>
          </div>
        </form>
      </div>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

/**
 * Why this file exists:
 * The boutique store relies on a WhatsApp-based order conversion funnel.
 * Instead of native payment gateway integration, checkout details are formatted 
 * into a structured chat message and pushed directly to the owner's WhatsApp number.
 */

import { WHATSAPP_NUMBER } from '../config/config';

/**
 * Formats order details and generates a WhatsApp deep link
 * @danishansari-dev order - The completed order object containing items and shipping address
 * @returns The fully formatted WhatsApp API URL link
 */
export function generateWhatsAppLink(order) {
  // Tricky logic: If order or items are missing, we must abort to prevent redirecting to an empty chat.
  if (!order || !order.items || order.items.length === 0) {
    return '';
  }

  const phone = WHATSAPP_NUMBER || '917300969491';
  
  // Format items lists with pricing details
  const itemsText = order.items
    .map((item, idx) => {
      const name = item.product?.name || 'Handmade Accessory';
      const qty = item.quantity;
      const price = item.product?.offerPrice || item.product?.price || 0;
      const colorText = item.product?.color ? ` (Color: ${item.product.color})` : '';
      return `${idx + 1}. *${name}*${colorText}\n   Qty: ${qty} x ₹${price} = ₹${qty * price}`;
    })
    .join('\n\n');

  const subtotal = order.items.reduce((sum, item) => {
    const price = item.product?.offerPrice || item.product?.price || 0;
    return sum + (price * item.quantity);
  }, 0);

  // Why this exists: Use the order's pre-calculated values to accurately reflect coupon discounts,
  // COD fees, and delivery rates decided during checkout. Falls back to dynamic math if fields are absent.
  const delivery = order.deliveryFee !== undefined ? order.deliveryFee : (subtotal >= 499 ? 0 : 49);
  const couponDiscount = order.couponDiscount || 0;
  const codFee = order.codFee || 0;
  const total = order.total !== undefined ? order.total : (subtotal + delivery - couponDiscount + codFee);
  
  const couponText = order.coupon ? `\n- Coupon Discount: −₹${couponDiscount} (${order.coupon})` : '';
  const codText = codFee > 0 ? `\n- COD Handling Fee: ₹${codFee}` : '';

  // Resolve shipping address parameters
  const addr = order.shippingAddress || {};
  const addressText = `${addr.street || ''}, ${addr.city || ''}, ${addr.state || ''} - ${addr.zipCode || ''}, ${addr.country || ''}`;

  const message = `🌸 *New Order from Scrunch & Create* 🌸

*Order Details:*
${itemsText}

*Summary:*
- Subtotal: ₹${subtotal}
- Delivery: ${delivery === 0 ? 'FREE' : `₹${delivery}`}${couponText}${codText}
- *Total: ₹${total}*

*Shipping Address:*
${addressText}

Thank you! I would like to finalize my color preferences and custom details.`;

  // Return the web link format
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

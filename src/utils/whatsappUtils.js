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

  // Compute subtotal and shipping fee dynamically (free delivery threshold at ₹499)
  const subtotal = order.items.reduce((sum, item) => {
    const price = item.product?.offerPrice || item.product?.price || 0;
    return sum + (price * item.quantity);
  }, 0);

  const delivery = subtotal >= 499 ? 0 : 49;
  const total = subtotal + delivery;

  // Resolve shipping address parameters
  const addr = order.shippingAddress || {};
  const addressText = `${addr.street || ''}, ${addr.city || ''}, ${addr.state || ''} - ${addr.zipCode || ''}, ${addr.country || ''}`;

  const message = `🌸 *New Order from Scrunch & Create* 🌸

*Order Details:*
${itemsText}

*Summary:*
- Subtotal: ₹${subtotal}
- Delivery: ${delivery === 0 ? 'FREE' : `₹${delivery}`}
- *Total: ₹${total}*

*Shipping Address:*
${addressText}

Thank you! I would like to finalize my color preferences and custom details.`;

  // Return the web link format
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

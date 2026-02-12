import { WHATSAPP_NUMBER } from '../config/config';

export function generateWhatsAppMessage(items, subtotal, customerDetails) {
    const delivery = subtotal >= 499 ? 0 : 49;
    const total = subtotal + delivery;

    let message = `*New Order Request*\n`;
    message += `--------------------------------\n`;

    if (customerDetails) {
        message += `*Customer Details:*\n`;
        message += `Name: ${customerDetails.name}\n`;
        message += `Phone: ${customerDetails.phone}\n`;
        message += `Email: ${customerDetails.email}\n`;
        const address = [
            customerDetails.addressLine1,
            customerDetails.addressLine2,
            customerDetails.city,
            customerDetails.state,
            customerDetails.pincode,
            customerDetails.country
        ].filter(Boolean).join(', ');
        message += `Address: ${address}\n`;
        message += `--------------------------------\n`;
    }

    message += `\n*Order Details:*\n`;

    items.forEach((item, index) => {
        const price = item.offerPrice || item.price;
        message += `\n${index + 1}. *${item.name}*`;
        if (item.category) message += `\n   Category: ${item.category}`;
        if (item.type || item.variant) message += `\n   Variant: ${item.type || item.variant}`;
        if (item.color) message += `\n   Color: ${item.color}`;
        if (item.pack) message += `\n   Pack: ${item.pack}`;
        message += `\n   Qty: ${item.qty} x ₹${price.toLocaleString('en-IN')}`;

        // Show total for this line item if > 1
        if (item.qty > 1) {
            message += ` = ₹${(price * item.qty).toLocaleString('en-IN')}`;
        }

        if (item.discountPercent > 0) {
            message += ` (${item.discountPercent}% OFF)`;
        }
    });

    message += `\n\n--------------------------------`;
    message += `\nSubtotal: ₹${subtotal.toLocaleString('en-IN')}`;
    // But the text requirement "Delivery: To be confirmed" might be a hard requirement?
    // "Subtotal: ... Delivery: To be confirmed Total Payable: ..."
    // I'll stick to Cart Logic for accuracy, but maybe append " (To be confirmed)" if not free?
    // Let's use the explicit text requested: "Delivery: To be confirmed".
    // BUT then Total Payable is unknown?
    // I'll use the calculated Total. And say "Delivery: Rs 49" or "Free".
    // "Delivery: To be confirmed" implies manual calculation.
    // I will check requirement 3 again.
    // "Delivery: To be confirmed".
    // "Total Payable: ..."

    // Logic: Use Cart logic for Total. 
    // Display "Delivery: ₹49 (To be confirmed)"?
    // User said "Price Accuracy... No recalculation".
    // I'll use what the Cart displays. if Cart allows shipping calc, use it.
    // Current Cart logic: `delivery = subtotal >= 499 ? 0 : 49`.
    // I'll use that.

    // Wait, I'll stick to key requirement: "Use cart-calculated prices only."
    // So if Cart says 49, I say 49.

    message += `\nDelivery: ${delivery === 0 ? 'Free' : '₹' + delivery}`;
    message += `\nTotal Payable: ₹${total.toLocaleString('en-IN')}`;

    message += `\n\nCustomer Message:\nHi, I want to place this order. Please confirm availability and shipping details.`;

    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
}

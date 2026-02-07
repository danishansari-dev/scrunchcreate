import { WHATSAPP_NUMBER } from '../config/config';

export function generateWhatsAppMessage(items, subtotal) {
    const delivery = subtotal >= 499 ? 0 : 49;
    const total = subtotal + delivery;

    let message = `Order from Scrunch & Create\n\nItems:\n`;

    items.forEach((item, index) => {
        message += `\n${index + 1}. ${item.name}`;
        if (item.category) message += `\n   Category: ${item.category}`;
        if (item.type || item.variant) message += `\n   Variant: ${item.type || item.variant}`;
        if (item.color) message += `\n   Color: ${item.color}`;
        // Pack size is often part of the name, but if explicit field exists:
        if (item.pack) message += `\n   Pack: ${item.pack}`;
        message += `\n   Quantity: ${item.qty}`;
        message += `\n   Price: ₹${item.price.toLocaleString('en-IN')}`;
        message += `\n`;
    });

    message += `\nSubtotal: ₹${subtotal.toLocaleString('en-IN')}`;
    message += `\nDelivery: ${delivery === 0 ? 'Free' : 'To be confirmed'}`; // Requirement says "To be confirmed" but Logic says Free if >499. User req: "Delivery: To be confirmed" for ALL? No, "Delivery: To be confirmed" in template. I will force string "To be confirmed" or calculated? 
    // User template: "Delivery: To be confirmed". 
    // But also "Total Payable: ...". Total payable depends on delivery.
    // If I say "Total Payable: 500" but delivery is confirmed later, that's conflicting.
    // However, Cart UI shows "Delivery: Free" or "49".
    // The requirement says "Prices match cart UI exactly".
    // So I should use the Cart's delivery logic.
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

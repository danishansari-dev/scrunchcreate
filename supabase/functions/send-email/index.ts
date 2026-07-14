// Follow standard Deno imports for Supabase Edge Functions
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const ADMIN_EMAILS_ENV = Deno.env.get("VITE_ADMIN_EMAILS") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/**
 * Interface representing the email trigger payload
 */
interface EmailPayload {
  type: "order_confirmation" | "status_update";
  order?: any;
  orderId?: string;
  status?: string;
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error("Missing RESEND_API_KEY environment variable");
    }

    const payload: EmailPayload = await req.json();
    let order = payload.order;

    // If order details are not provided directly but an orderId is, fetch from database
    if (!order && payload.orderId && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", payload.orderId)
        .single();
      
      if (error) {
        throw new Error(`Failed to fetch order: ${error.message}`);
      }
      order = data;
    }

    if (!order) {
      throw new Error("No order data available for email payload");
    }

    const customerEmail = order.contact?.email;
    if (!customerEmail) {
      throw new Error("No customer email address found in order contact details");
    }

    let emailSubject = "";
    let emailHtml = "";
    let emailRecipient = customerEmail;

    const items = order.items || [];
    const subtotal = items.reduce((sum: number, item: any) => {
      const price = item.product?.offerPrice || item.product?.price || 0;
      return sum + (price * item.quantity);
    }, 0);
    const delivery = order.delivery_fee ?? order.deliveryFee ?? 0;
    const discount = order.coupon_discount ?? order.couponDiscount ?? 0;
    const cod = order.cod_fee ?? order.codFee ?? 0;
    const total = order.total ?? (subtotal + delivery - discount + cod);

    const itemsListHtml = items.map((item: any) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #f0e6ed; color: #4a1c40;">
          <div style="font-weight: bold;">${item.product?.name || "Handmade Accessory"}</div>
          ${item.product?.color ? `<div style="font-size: 12px; color: #8c5a82;">Color: ${item.product.color}</div>` : ""}
          <div style="font-size: 12px; color: #8c5a82;">Qty: ${item.quantity}</div>
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #f0e6ed; text-align: right; color: #4a1c40; font-weight: bold;">
          ₹${((item.product?.offerPrice || item.product?.price || 0) * item.quantity).toLocaleString("en-IN")}
        </td>
      </tr>
    `).join("");

    if (payload.type === "order_confirmation") {
      emailSubject = `Your Scrunch & Create Order #${order.id.replace("order_", "")} is confirmed! 🌸`;
      
      emailHtml = `
        <div style="font-family: 'Outfit', 'Inter', sans-serif; background-color: #faf6f9; padding: 40px 20px; color: #362d27;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #f3e9f1; overflow: hidden; box-shadow: 0 4px 20px rgba(74, 28, 64, 0.05);">
            <!-- Header -->
            <div style="background-color: #4a1c40; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 1px;">Scrunch & Create</h1>
              <p style="color: #f7eaf4; margin: 5px 0 0 0; font-size: 14px;">Handmade with Love & Premium Aesthetics</p>
            </div>
            
            <!-- Body -->
            <div style="padding: 30px;">
              <h2 style="color: #4a1c40; font-size: 20px; margin-top: 0;">Hi ${order.contact?.name || "there"},</h2>
              <p style="font-size: 15px; line-height: 1.6; color: #5a4b41;">
                Thank you so much for your order! We are currently processing your handmade goodies and will notify you as soon as they are shipped.
              </p>
              
              <!-- Order Details Card -->
              <div style="background-color: #fcf9fb; border-radius: 12px; padding: 20px; border: 1px dashed #e8d5e4; margin: 25px 0;">
                <h3 style="margin-top: 0; color: #4a1c40; font-size: 16px; border-bottom: 1px solid #f0e6ed; padding-bottom: 8px;">Order Details (ID: #${order.id.replace("order_", "")})</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr>
                      <th style="text-align: left; color: #8c5a82; font-size: 12px; text-transform: uppercase; padding-bottom: 8px;">Item</th>
                      <th style="text-align: right; color: #8c5a82; font-size: 12px; text-transform: uppercase; padding-bottom: 8px;">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsListHtml}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td style="padding: 8px 0 4px 0; color: #5a4b41;">Subtotal</td>
                      <td style="padding: 8px 0 4px 0; text-align: right; color: #362d27;">₹${subtotal.toLocaleString("en-IN")}</td>
                    </tr>
                    <tr>
                      <td style="padding: 4px 0; color: #5a4b41;">Delivery Fee</td>
                      <td style="padding: 4px 0; text-align: right; color: #362d27;">${delivery === 0 ? "FREE" : `₹${delivery}`}</td>
                    </tr>
                    ${discount > 0 ? `
                    <tr>
                      <td style="padding: 4px 0; color: #c2405d;">Discount (${order.coupon || "Coupon"})</td>
                      <td style="padding: 4px 0; text-align: right; color: #c2405d;">-₹${discount.toLocaleString("en-IN")}</td>
                    </tr>` : ""}
                    ${cod > 0 ? `
                    <tr>
                      <td style="padding: 4px 0; color: #5a4b41;">COD Handling Fee</td>
                      <td style="padding: 4px 0; text-align: right; color: #362d27;">₹${cod}</td>
                    </tr>` : ""}
                    <tr>
                      <td style="padding: 12px 0 0 0; font-weight: bold; font-size: 18px; color: #4a1c40; border-top: 1px solid #f0e6ed;">Total</td>
                      <td style="padding: 12px 0 0 0; text-align: right; font-weight: bold; font-size: 18px; color: #4a1c40; border-top: 1px solid #f0e6ed;">₹${total.toLocaleString("en-IN")}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <!-- Shipping Info -->
              <div style="margin-bottom: 25px;">
                <h4 style="color: #4a1c40; margin: 0 0 8px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">📍 Shipping Address</h4>
                <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #5a4b41;">
                  <strong>${order.contact?.name}</strong><br/>
                  ${order.shipping_address?.street || order.shippingAddress?.street}<br/>
                  ${order.shipping_address?.city || order.shippingAddress?.city}, ${order.shipping_address?.state || order.shippingAddress?.state} - ${order.shipping_address?.zipCode || order.shippingAddress?.zipCode || order.shippingAddress?.pincode}<br/>
                  ${order.shipping_address?.country || order.shippingAddress?.country}
                </p>
              </div>

              <!-- Payment Method -->
              <div style="margin-bottom: 25px;">
                <h4 style="color: #4a1c40; margin: 0 0 8px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">💳 Payment Method</h4>
                <p style="margin: 0; font-size: 14px; color: #5a4b41; text-transform: uppercase;">
                  ${order.payment?.method || "Online Payment"}
                </p>
              </div>

              <div style="text-align: center; margin-top: 35px;">
                <p style="font-size: 13px; color: #8c5a82;">Need to customize colors, sizes, or have questions about delivery?</p>
                <a href="https://wa.me/917300969491" style="display: inline-block; background-color: #25d366; color: #ffffff; text-decoration: none; padding: 12px 25px; border-radius: 99px; font-weight: bold; font-size: 14px; box-shadow: 0 4px 10px rgba(37, 211, 102, 0.2);">
                  Chat with us on WhatsApp 💬
                </a>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #faf6f9; border-top: 1px solid #f0e6ed; padding: 20px; text-align: center; font-size: 12px; color: #8c5a82;">
              <p style="margin: 0 0 8px 0;">Scrunch & Create, Jaipur, Rajasthan, India</p>
              <p style="margin: 0;">Follow our aesthetics on <a href="https://instagram.com/scrunchandcreate" style="color: #4a1c40; text-decoration: none; font-weight: bold;">Instagram</a></p>
            </div>
          </div>
        </div>
      `;
    } else if (payload.type === "status_update") {
      const trackingNum = order.tracking_number || order.trackingNumber || "";
      const trackingUrl = order.tracking_url || order.trackingUrl || "";
      const isShipped = payload.status === "Dispatched" || payload.status === "Shipped";

      emailSubject = `Order #${order.id.replace("order_", "")} Status Update: ${payload.status}! 📦`;
      
      emailHtml = `
        <div style="font-family: 'Outfit', 'Inter', sans-serif; background-color: #faf6f9; padding: 40px 20px; color: #362d27;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #f3e9f1; overflow: hidden; box-shadow: 0 4px 20px rgba(74, 28, 64, 0.05);">
            <!-- Header -->
            <div style="background-color: #4a1c40; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 1px;">Scrunch & Create</h1>
              <p style="color: #f7eaf4; margin: 5px 0 0 0; font-size: 14px;">Order Status Notification</p>
            </div>
            
            <!-- Body -->
            <div style="padding: 30px;">
              <h2 style="color: #4a1c40; font-size: 20px; margin-top: 0;">Hi ${order.contact?.name || "there"},</h2>
              <p style="font-size: 15px; line-height: 1.6; color: #5a4b41;">
                Your order **#${order.id.replace("order_", "")}** status has been updated to:  
                <strong style="color: #4a1c40; font-size: 16px; background-color: #fcecf7; padding: 4px 8px; border-radius: 4px; display: inline-block;">${payload.status}</strong>
              </p>

              ${isShipped && trackingNum ? `
              <!-- Tracking Info Card -->
              <div style="background-color: #fcf9fb; border-radius: 12px; padding: 20px; border: 1px solid #e8d5e4; margin: 25px 0;">
                <h3 style="margin-top: 0; color: #4a1c40; font-size: 15px;">📦 Shipment Details</h3>
                <p style="margin: 0 0 15px 0; font-size: 14px; color: #5a4b41;">
                  Your package has been dispatched and is on its way to you!
                </p>
                <div style="background-color: #ffffff; border: 1px solid #f0e6ed; padding: 12px; border-radius: 8px; font-size: 14px; font-family: monospace; color: #4a1c40; margin-bottom: 15px;">
                  Tracking ID: <strong>${trackingNum}</strong>
                </div>
                ${trackingUrl ? `
                <a href="${trackingUrl}" style="display: inline-block; background-color: #4a1c40; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; font-size: 13px;">
                  Track Package 🚚
                </a>` : ""}
              </div>` : ""}

              <p style="font-size: 14px; line-height: 1.6; color: #5a4b41; margin-top: 25px;">
                You can review your order progress at any time by logging into your account and visiting your profile page.
              </p>

              <div style="text-align: center; margin-top: 30px; border-top: 1px solid #f0e6ed; padding-top: 20px;">
                <a href="https://wa.me/917300969491" style="color: #4a1c40; text-decoration: none; font-size: 14px; font-weight: bold;">
                  Have questions? Chat on WhatsApp 💬
                </a>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #faf6f9; border-top: 1px solid #f0e6ed; padding: 20px; text-align: center; font-size: 12px; color: #8c5a82;">
              <p style="margin: 0 0 8px 0;">Scrunch & Create, Jaipur, Rajasthan, India</p>
              <p style="margin: 0;">Follow us on <a href="https://instagram.com/scrunchandcreate" style="color: #4a1c40; text-decoration: none; font-weight: bold;">Instagram</a></p>
            </div>
          </div>
        </div>
      `;
    }

    // Call Resend API to send the email
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Scrunch & Create <orders@scrunchandcreate.com>",
        to: [emailRecipient],
        subject: emailSubject,
        html: emailHtml,
      }),
    });

    const resData = await res.json();
    if (!res.ok) {
      throw new Error(`Resend API Error: ${JSON.stringify(resData)}`);
    }

    // If it's a new order confirmation, also notify the admin
    if (payload.type === "order_confirmation") {
      const adminEmails = ADMIN_EMAILS_ENV.split(",").map(e => e.trim()).filter(Boolean);
      if (adminEmails.length > 0) {
        const adminSubject = `🚨 New Order #${order.id.replace("order_", "")} Received! (Total: ₹${total})`;
        const adminHtml = `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2>Hello Admin,</h2>
            <p>A new order has been placed on Scrunch & Create!</p>
            <ul>
              <li><strong>Order ID:</strong> ${order.id}</li>
              <li><strong>Customer Name:</strong> ${order.contact?.name}</li>
              <li><strong>Customer Email:</strong> ${order.contact?.email}</li>
              <li><strong>Customer Phone:</strong> ${order.contact?.phone}</li>
              <li><strong>Total Amount:</strong> ₹${total}</li>
              <li><strong>Payment Method:</strong> ${order.payment?.method}</li>
            </ul>
            <p>Log in to the admin panel at <a href="https://scrunchcreate.vercel.app/admin">scrunchcreate.vercel.app/admin</a> to process shipment.</p>
          </div>
        `;

        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "Scrunch & Create Notifications <orders@scrunchandcreate.com>",
            to: adminEmails,
            subject: adminSubject,
            html: adminHtml,
          }),
        }).catch(err => {
          console.warn("Failed to notify admin via email:", err.message);
        });
      }
    }

    return new Response(JSON.stringify({ success: true, messageId: resData.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

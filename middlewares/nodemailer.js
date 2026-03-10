import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();

// 📧 Configure Resend
const resend = new Resend(process.env.RESEND_API_KEY);

export const sendAdminEmail = async (order) => {
  try {
    const emailBody = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 700px; margin: 0 auto;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1A1A1A 0%, #333333 100%); padding: 40px 20px; text-align: center; color: white; border-radius: 12px 12px 0 0;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 700;">✨ New Order Received!</h1>
          <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">A luxury couture piece is waiting to be prepared</p>
        </div>

        <!-- Main content -->
        <div style="background: white; padding: 30px; border: 1px solid #E5E7EB; border-top: none;">
          
          <!-- Order ID Alert -->
          <div style="background: #F0F9FF; border-left: 4px solid #1A1A1A; padding: 16px; border-radius: 6px; margin-bottom: 25px;">
            <p style="margin: 0; color: #1E40AF; font-weight: 600; font-size: 16;">Order ID: <span style="font-family: monospace; background: white; padding: 2px 6px; border-radius: 4px;">${order._id}</span></p>
          </div>

          <!-- Customer Section -->
          <h2 style="color: #1A1A1A; font-size: 16px; margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: 1px;">📋 Customer Information</h2>
          <div style="background: #F9FAFB; padding: 16px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #C5A059;">
            <p style="margin: 8px 0; color: #333; font-size: 14px;"><strong>Name:</strong> ${order.userInfo.name}</p>
            <p style="margin: 8px 0; color: #333; font-size: 14px;"><strong>Email:</strong> <a href="mailto:${order.userInfo.email}" style="color: #1A1A1A; text-decoration: none;">${order.userInfo.email}</a></p>
            <p style="margin: 8px 0; color: #333; font-size: 14px;"><strong>Phone:</strong> ${order.userInfo.phone}</p>
          </div>

          <!-- Delivery Address Section -->
          <h2 style="color: #1A1A1A; font-size: 16px; margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: 1px;">📍 Delivery Address</h2>
          <div style="background: #F9FAFB; padding: 16px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #1A1A1A;">
            <p style="margin: 0; color: #333; font-size: 14px; line-height: 1.6;">
              ${order.userInfo.address}<br>
              ${order.userInfo.city}, ${order.userInfo.country} - ${order.userInfo.postalCode}
            </p>
          </div>

          <!-- Items Section -->
          <h2 style="color: #1A1A1A; font-size: 16px; margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: 1px;">🛒 Items Ordered</h2>
          <ul style="background: #F9FAFB; padding: 20px; border-radius: 8px; border-left: 4px solid #1A1A1A; margin-bottom: 25px; list-style: none; margin: 0 0 25px 0;">
            ${order.items.map(item => `<li style="margin: 10px 0; color: #333; font-size: 14px; padding-bottom: 10px; border-bottom: 1px solid #E5E7EB;"><strong>${item.name}</strong> - ${item.quantity} × ₹${item.price} = <span style="color: #1A1A1A; font-weight: 600;">₹${item.quantity * item.price}</span></li>`).join("")}
          </ul>

          <!-- Payment Section -->
          <div style="background: linear-gradient(135deg, #FAF9F6 0%, #F5F5F5 100%); padding: 20px; border-radius: 8px; border: 2px solid #1A1A1A; margin-bottom: 25px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 18px; font-weight: 600; color: #333;">Order Total:</span>
              <span style="font-size: 28px; font-weight: 800; color: #1A1A1A;">₹${order.totalAmount}</span>
            </div>
            <hr style="border: none; border-top: 1px solid #D8BFD8; margin: 15px 0;">
            <p style="margin: 0; color: #666; font-size: 13px;"><strong>📲 Payment ID:</strong> ${order.razorpayPaymentId}</p>
          </div>

          <!-- Action Button -->
          <div style="text-align: center; margin-bottom: 25px;">
            <a href="${process.env.ADMIN_PANEL_URL || '#'}" style="background: linear-gradient(135deg, #1A1A1A 0%, #333333 100%); color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block; font-size: 14px;">View Order Details</a>
          </div>

          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 25px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
            This is an automated notification. Please do not reply to this email.
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #F9FAFB; padding: 20px; text-align: center; color: #999; font-size: 11px; border-radius: 0 0 12px 12px; border: 1px solid #E5E7EB; border-top: none;">
          <p style="margin: 0;">© 2026 Khushi Chauhan Designer Studio</p>
        </div>
      </div>
    `;

    await resend.emails.send({
      from: "Khushi Chauhan <onboarding@resend.dev>",
      to: "vikasrankmantra@gmail.com",
      subject: `✨ New Order Received - ${order._id}`,
      html: emailBody,
    });
    return true;
  } catch (error) {
    console.error("Error sending admin email:", error);
    return false;
  }
};

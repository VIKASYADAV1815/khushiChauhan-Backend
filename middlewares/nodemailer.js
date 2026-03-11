import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();

// 📧 Configure Resend
const resend = new Resend(process.env.RESEND_API_KEY);

export const sendAdminEmail = async (order) => {
  try {
    const adminRecipients = (process.env.ADMIN_EMAIL || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (!adminRecipients.length) {
      console.warn("ADMIN_EMAIL is not configured; admin order email not sent.");
      return false;
    }

    const emailBody = `
      <div style="font-family: 'Georgia', 'Times New Roman', serif; max-width: 620px; margin: 0 auto; background: #FFFDFB;">
        <!-- Top accent -->
        <div style="height: 4px; background: linear-gradient(90deg, #E29578 0%, #C5A059 50%, #1A1A1A 100%);"></div>

        <!-- Header - elegant minimal -->
        <div style="padding: 36px 28px 28px; text-align: center; border-bottom: 1px solid #F5EBE0;">
          <p style="margin: 0 0 6px 0; font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase; color: #E29578; font-weight: 600;">New Order</p>
          <h1 style="margin: 0; font-size: 26px; font-weight: 400; color: #1A1A1A; letter-spacing: 0.02em;">A new order has been placed</h1>
          <p style="margin: 10px 0 0 0; font-size: 13px; color: #6B6B6B;">Khushi Chauhan Designer Studio</p>
        </div>

        <!-- Order ID - subtle highlight -->
        <div style="margin: 24px 28px 0; padding: 14px 18px; background: #FDF8F5; border-radius: 6px; border-left: 3px solid #E29578;">
          <p style="margin: 0; font-size: 12px; color: #6B6B6B; letter-spacing: 0.05em;">Order ID</p>
          <p style="margin: 4px 0 0 0; font-size: 15px; font-weight: 600; color: #1A1A1A; font-family: 'Consolas', monospace;">${order._id}</p>
        </div>

        <!-- Customer -->
        <div style="margin: 24px 28px 0; padding: 0 0 20px; border-bottom: 1px solid #F5EBE0;">
          <p style="margin: 0 0 12px 0; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #8C8C8C;">Customer</p>
          <p style="margin: 0; font-size: 15px; color: #1A1A1A; line-height: 1.6;"><strong>${order.userInfo.name}</strong></p>
          <p style="margin: 6px 0 0 0; font-size: 14px; color: #333;"><a href="mailto:${order.userInfo.email}" style="color: #E29578; text-decoration: none;">${order.userInfo.email}</a></p>
          <p style="margin: 4px 0 0 0; font-size: 14px; color: #333;">${order.userInfo.phone}</p>
        </div>

        <!-- Delivery Address -->
        <div style="margin: 20px 28px 0; padding: 0 0 20px; border-bottom: 1px solid #F5EBE0;">
          <p style="margin: 0 0 12px 0; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #8C8C8C;">Delivery Address</p>
          <p style="margin: 0; font-size: 14px; color: #333; line-height: 1.65;">
            ${order.userInfo.address}<br>
            ${order.userInfo.city}, ${order.userInfo.state} ${order.userInfo.postalCode}<br>
            ${order.userInfo.country}
          </p>
        </div>

        <!-- Items -->
        <div style="margin: 20px 28px 0; padding: 0 0 20px; border-bottom: 1px solid #F5EBE0;">
          <p style="margin: 0 0 14px 0; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #8C8C8C;">Items</p>
          <table style="width: 100%; border-collapse: collapse;">
            ${order.items.map(
              (item) => `
            <tr style="border-bottom: 1px solid #F0EBE6;">
              <td style="padding: 10px 0; font-size: 14px; color: #1A1A1A;">${item.name}</td>
              <td style="padding: 10px 0; font-size: 14px; color: #333; text-align: right;">${item.quantity} × ₹${item.price}</td>
              <td style="padding: 10px 0; font-size: 14px; font-weight: 600; color: #1A1A1A; text-align: right;">₹${item.quantity * item.price}</td>
            </tr>`
            ).join("")}
          </table>
        </div>

        <!-- Total & Payment -->
        <div style="margin: 20px 28px 0; padding: 20px; background: linear-gradient(135deg, #1A1A1A 0%, #2d2d2d 100%); border-radius: 8px;">
          <table style="width: 100%;">
            <tr>
              <td style="font-size: 14px; color: rgba(255,255,255,0.9);">Order Total</td>
              <td style="font-size: 22px; font-weight: 600; color: #FFF; text-align: right;">₹${order.totalAmount}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding-top: 10px; font-size: 12px; color: rgba(255,255,255,0.7);">Payment ID: ${order.razorpayPaymentId}</td>
            </tr>
          </table>
        </div>

        <!-- View Order Details - commented out until admin panel is ready -->
        <!-- <div style="text-align: center; margin: 28px 28px 0;">
          <a href="${process.env.ADMIN_PANEL_URL || '#'}" style="display: inline-block; background: #1A1A1A; color: white; padding: 14px 28px; text-decoration: none; font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase;">View Order Details</a>
        </div> -->

        <!-- Footer -->
        <div style="margin: 32px 28px 24px; padding-top: 20px; border-top: 1px solid #F5EBE0; text-align: center;">
          <p style="margin: 0; font-size: 11px; color: #999;">Automated notification · Khushi Chauhan Designer Studio</p>
          <p style="margin: 6px 0 0 0; font-size: 10px; color: #BBB;">© 2026</p>
        </div>

        <!-- Bottom accent -->
        <div style="height: 4px; background: linear-gradient(90deg, #1A1A1A 0%, #C5A059 50%, #E29578 100%);"></div>
      </div>
    `;

    await resend.emails.send({
      from:
        process.env.RESEND_FROM_ADMIN ||
        process.env.RESEND_FROM ||
        "Khushi Chauhan Designer Studio <onboarding@resend.dev>",
      to: adminRecipients,
      subject: `New order — ${order._id} · Khushi Chauhan Designer Studio`,
      html: emailBody,
    });

    return true;
  } catch (error) {
    console.error("Error sending admin email:", error);
    return false;
  }
};

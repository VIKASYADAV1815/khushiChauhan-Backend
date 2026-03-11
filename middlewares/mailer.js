import dotenv from "dotenv";
import { Resend } from "resend";

dotenv.config();

// 📧 Configure Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// 🔒 Generate 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// 📧 Send OTP via email
export const sendOTPEmail = async (email, otp, name) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is missing. OTP email not sent.");
      return { ok: false, error: "Email service not configured" };
    }

    const safeName = (name || "").toString().trim() || "there";
    const safeEmail = (email || "").toString().trim();
    if (!safeEmail) return { ok: false, error: "Missing recipient email" };
    const otpDigits = otp.toString().split("").slice(0, 6);

    const previewText = `Your Khushi Chauhan Designer Studio verification code is ${otpDigits.join("")}. This code expires in 10 minutes.`;

    const html = `
      <div style="margin:0;padding:0;background:#F5F1EB;">
        <div style="max-width:520px;margin:0 auto;padding:20px 12px;">
          <!-- Card -->
          <div style="background:#FFFFFF;border-radius:18px;border:1px solid #E7DFD3;box-shadow:0 18px 40px rgba(15,23,42,0.08);overflow:hidden;">
            <!-- Brand / Logo -->
            <div style="padding:18px 18px 10px;text-align:center;border-bottom:1px solid #F1E8DD;">
              <img
                src="https://pub-141831e61e69445289222976a15b6fb3.r2.dev/Image_to_url_V2/logo-imagetourl.cloud-1773202506998-lijpc5.png"
                alt="Khushi Chauhan Designer Studio"
                style="max-width:160px;height:auto;display:block;margin:0 auto 8px;border-radius:999px;"
              />
              <div style="font-size:10px;letter-spacing:0.26em;text-transform:uppercase;color:#9A7B4F;font-weight:600;">
                KHUSHI CHAUHAN DESIGNER STUDIO
              </div>
            </div>

            <!-- Content -->
            <div style="padding:18px 18px 16px;">
              <div style="font-size:20px;line-height:1.3;font-weight:700;color:#111827;margin-bottom:4px;">
                Your verification code
              </div>
              <div style="font-size:13px;line-height:1.6;color:#4B5563;margin-bottom:14px;">
                Hello ${safeName}, use this one-time passcode to verify your email for
                <span style="font-weight:600;color:#9A7B4F;">Khushi Chauhan Designer Studio</span>.
              </div>

              <!-- OTP Row -->
              <div style="padding:12px 10px;background:#FBF8F3;border-radius:14px;border:1px solid #E7DFD3;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;border-collapse:separate;border-spacing:6px 0;">
                  <tr>
                    ${otpDigits
                      .map(
                        (d) => `
                          <td style="padding:0;">
                            <div style="width:40px;height:50px;line-height:50px;text-align:center;border-radius:12px;background:#FFFFFF;border:1px solid rgba(154,123,79,0.45);box-shadow:0 10px 24px rgba(15,23,42,0.06);">
                              <span style="display:inline-block;font-size:20px;font-weight:800;letter-spacing:0.08em;color:#111827;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono','Courier New',monospace;">
                                ${d}
                              </span>
                            </div>
                          </td>
                        `
                      )
                      .join("")}
                  </tr>
                </table>
                <div style="margin-top:10px;text-align:center;font-size:12px;color:#4B5563;">
                  Expires in <strong style="color:#111827;">10 minutes</strong>. If you didn’t request this, you can safely ignore this email.
                </div>
              </div>

              <!-- Meta -->
              <div style="margin-top:14px;font-size:12px;line-height:1.7;color:#6B7280;">
                <div>
                  <strong style="color:#111827;">Sent to:</strong>
                  <span style="font-family:ui-monospace,Menlo,Monaco,Consolas,'Liberation Mono','Courier New',monospace;">${safeEmail}</span>
                </div>
                <div style="margin-top:4px;">
                  <strong style="color:#111827;">Security tip:</strong>
                  Never share this code with anyone. Khushi Chauhan Designer Studio will never ask you for your OTP.
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div style="padding:10px 16px 14px;border-top:1px solid #F3EBE0;text-align:center;color:#9CA3AF;">
              <div style="font-size:11px;line-height:1.6;">
                Having trouble? Check your spam or promotions folder, or request a new code from the verification screen.
              </div>
              <div style="margin-top:6px;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#A8A29E;">
                © 2026 Khushi Chauhan Designer Studio
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    const result = await resend.emails.send({
      from: process.env.RESEND_FROM || "Khushi Chauhan Designer Studio <onboarding@resend.dev>",
      // Now always send to the actual email entered by the user
      to: [safeEmail],
      subject: "Your verification code • Khushi Chauhan Designer Studio",
      html,
      text: previewText,
    });

    if (result?.error) {
      console.error("Resend error sending OTP email:", result.error);
      return { ok: false, error: result.error?.message || "Email provider error" };
    }

    return { ok: true };
  } catch (error) {
    console.error("Error sending OTP email:", error);
    return { ok: false, error: error instanceof Error ? error.message : "Unknown email error" };
  }
};

// 📧 Send admin email for new order
export const sendAdminEmail = async (order) => {
  try {
    const itemsList = order.items
      .map(
        (item, index) =>
          `<tr style="border-bottom: 1px solid #E5E7EB;">
        <td style="padding: 12px; border-right: 1px solid #E5E7EB;">${item.name}</td>
        <td style="padding: 12px; text-align: center; border-right: 1px solid #E5E7EB;">${item.quantity}</td>
        <td style="padding: 12px; text-align: right; border-right: 1px solid #E5E7EB;">₹${item.price}</td>
        <td style="padding: 12px; text-align: right; font-weight: 600; color: #7C3AED;">₹${
            item.price * item.quantity
          }</td>
      </tr>`
      )
      .join("");

    const emailBody = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 700px; margin: 0 auto;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%); padding: 40px 20px; text-align: center; color: white; border-radius: 12px 12px 0 0;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 700;">🧁 New Order Received!</h1>
          <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">A delicious order is waiting to be prepared</p>
        </div>

        <!-- Main content -->
        <div style="background: white; padding: 30px; border: 1px solid #E5E7EB; border-top: none;">
          
          <!-- Order ID Alert -->
          <div style="background: #F0F9FF; border-left: 4px solid #7C3AED; padding: 16px; border-radius: 6px; margin-bottom: 25px;">
            <p style="margin: 0; color: #1E40AF; font-weight: 600; font-size: 16;">Order ID: <span style="font-family: monospace; background: white; padding: 2px 6px; border-radius: 4px;">${order._id}</span></p>
          </div>

          <!-- Customer Section -->
          <h2 style="color: #7C3AED; font-size: 16px; margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: 1px;">📋 Customer Information</h2>
          <div style="background: #F9FAFB; padding: 16px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #FCD34D;">
            <p style="margin: 8px 0; color: #333; font-size: 14px;"><strong>Name:</strong> ${order.userInfo.name}</p>
            <p style="margin: 8px 0; color: #333; font-size: 14px;"><strong>Email:</strong> <a href="mailto:${order.userInfo.email}" style="color: #7C3AED; text-decoration: none;">${order.userInfo.email}</a></p>
            <p style="margin: 8px 0; color: #333; font-size: 14px;"><strong>Phone:</strong> ${order.userInfo.phone}</p>
          </div>

          <!-- Delivery Address Section -->
          <h2 style="color: #7C3AED; font-size: 16px; margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: 1px;">📍 Delivery Address</h2>
          <div style="background: #F9FAFB; padding: 16px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #10B981;">
            <p style="margin: 0; color: #333; font-size: 14px; line-height: 1.6;">
              ${order.userInfo.address}<br>
              ${order.userInfo.city}, ${order.userInfo.state} ${order.userInfo.postalCode}<br>
              ${order.userInfo.country || 'India'}
            </p>
          </div>

          <!-- Items Section -->
          <h2 style="color: #7C3AED; font-size: 16px; margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: 1px;">🛒 Items Ordered</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; background: white; border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden;">
            <thead>
              <tr style="background: linear-gradient(135deg, #7C3AED 0%, #A855F7 100%); color: white;">
                <th style="padding: 12px; text-align: left; font-weight: 600;">Product</th>
                <th style="padding: 12px; text-align: center; font-weight: 600;">Quantity</th>
                <th style="padding: 12px; text-align: right; font-weight: 600;">Unit Price</th>
                <th style="padding: 12px; text-align: right; font-weight: 600;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsList}
            </tbody>
          </table>

          <!-- Payment Section -->
          <div style="background: linear-gradient(135deg, #F3E8FF 0%, #EDE9FE 100%); padding: 20px; border-radius: 8px; border: 2px solid #7C3AED; margin-bottom: 25px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 18px; font-weight: 600; color: #333;">Order Total:</span>
              <span style="font-size: 28px; font-weight: 800; color: #7C3AED;">₹${order.totalAmount}</span>
            </div>
            <hr style="border: none; border-top: 1px solid #D8BFD8; margin: 15px 0;">
            <p style="margin: 0; color: #666; font-size: 13px;"><strong>Payment Status:</strong> <span style="background: #ECF0F1; padding: 4px 8px; border-radius: 4px; color: #27AE60; font-weight: 600;">${order.paymentStatus}</span></p>
          </div>

          <!-- Action Button -->
          <div style="text-align: center; margin-bottom: 25px;">
            <a href="${process.env.ADMIN_PANEL_URL || '#'}" style="background: linear-gradient(135deg, #7C3AED 0%, #A855F7 100%); color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block; font-size: 14px;">View Order Details</a>
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
      from: process.env.RESEND_FROM_ADMIN || process.env.RESEND_FROM || "Khushi Chauhan Designer Studio <onboarding@resend.dev>",
      to: (process.env.ADMIN_EMAIL || "").split(",").map((s) => s.trim()).filter(Boolean),
      subject: `✨ New Order Received - ${order._id}`,
      html: emailBody,
    });
    return true;
  } catch (error) {
    console.error("Error sending admin email:", error);
    return false;
  }
};

export default { sendOTPEmail, sendAdminEmail, generateOTP };

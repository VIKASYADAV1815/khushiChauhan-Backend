import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();

// 📧 Configure Resend
const resend = new Resend(process.env.RESEND_API_KEY);

const formatINR = (n) => {
  try {
    return new Intl.NumberFormat("en-IN").format(Number(n || 0));
  } catch {
    return String(n || 0);
  }
};

const commonStyles = `
  background-color: #F8F5F0;
  font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  margin: 0;
  padding: 0;
`;

const cardStyles = `
  background-color: #FFFFFF;
  max-width: 600px;
  margin: 40px auto;
  border-radius: 20px;
  border: 1px solid #E7DFD3;
  box-shadow: 0 20px 50px rgba(0,0,0,0.05);
  overflow: hidden;
`;

const headerStyles = `
  padding: 40px 20px;
  text-align: center;
  border-bottom: 1px solid #F1E8DD;
  background-color: #FFFFFF;
`;

const logoStyles = `
  max-width: 180px;
  height: auto;
  display: block;
  margin: 0 auto 12px;
  border-radius: 999px;
`;

const brandTextStyles = `
  font-size: 11px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: #9A7B4F;
  font-weight: 700;
`;

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

    const itemsRows = (order.items || [])
      .map(
        (item) => `
          <tr style="border-bottom: 1px solid #F1E8DD;">
            <td style="padding: 20px 0; vertical-align: top;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
                <tr>
                  <td style="width: 100px; padding-right: 20px; vertical-align: top;">
                    ${
                      item.image
                        ? `<img src="${item.image}" alt="${item.name}" width="100" height="125" style="display:block;border-radius:12px;object-fit:cover;border:1px solid #E7DFD3;" />`
                        : `<div style="width:100px;height:125px;border-radius:12px;background:#FBF8F3;border:1px solid #E7DFD3;"></div>`
                    }
                  </td>
                  <td style="vertical-align: top; padding-top: 8px;">
                    <div style="font-size: 16px; font-weight: 700; color: #111827; margin-bottom: 6px; line-height: 1.4;">${item.name}</div>
                    <div style="font-size: 14px; color: #6B7280; margin-bottom: 4px;">Quantity: <span style="font-weight: 600; color: #111827;">${item.quantity}</span></div>
                    <div style="font-size: 14px; color: #6B7280;">Unit Price: <span style="font-weight: 600; color: #111827;">₹${formatINR(item.price)}</span></div>
                  </td>
                </tr>
              </table>
            </td>
            <td style="padding: 20px 0; font-size: 16px; font-weight: 700; color: #111827; text-align: right; vertical-align: top; padding-top: 28px;">
              ₹${formatINR((item.quantity || 0) * (item.price || 0))}
            </td>
          </tr>`
      )
      .join("");

    const emailBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          @media only screen and (max-width: 620px) {
            .container { width: 100% !important; margin: 0 !important; border-radius: 0 !important; }
            .content { padding: 20px !important; }
            .item-img { width: 80px !important; height: 100px !important; }
          }
        </style>
      </head>
      <body style="${commonStyles}">
        <div class="container" style="${cardStyles}">
          <div style="${headerStyles}">
            <img src="https://pub-141831e61e69445289222976a15b6fb3.r2.dev/Image_to_url_V2/logo-imagetourl.cloud-1773202506998-lijpc5.png" alt="Logo" style="${logoStyles}" />
            <div style="${brandTextStyles}">NEW ORDER NOTIFICATION</div>
          </div>

          <div class="content" style="padding: 40px 30px;">
            <div style="margin-bottom: 30px; padding: 20px; background: #FBF8F3; border-radius: 12px; border: 1px solid #E7DFD3;">
              <div style="font-size: 12px; color: #9A7B4F; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">Order Reference</div>
              <div style="font-size: 20px; font-weight: 700; color: #111827; font-family: 'Courier New', monospace;">#${order._id.toString().toUpperCase()}</div>
            </div>

            <div style="margin-bottom: 40px;">
              <div style="font-size: 14px; font-weight: 700; color: #111827; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 16px; border-bottom: 2px solid #F1E8DD; padding-bottom: 8px;">Customer Details</div>
              <table role="presentation" style="width: 100%; font-size: 15px; color: #4B5563; line-height: 1.6;">
                <tr><td style="padding: 4px 0; width: 100px;"><strong>Name:</strong></td><td style="color: #111827;">${order.userInfo.name}</td></tr>
                <tr><td style="padding: 4px 0;"><strong>Email:</strong></td><td><a href="mailto:${order.userInfo.email}" style="color: #9A7B4F; text-decoration: none;">${order.userInfo.email}</a></td></tr>
                <tr><td style="padding: 4px 0;"><strong>Phone:</strong></td><td style="color: #111827;">${order.userInfo.phone}</td></tr>
                <tr><td style="padding: 4px 0; vertical-align: top;"><strong>Address:</strong></td><td style="color: #111827;">${order.userInfo.address}, ${order.userInfo.city}, ${order.userInfo.state} - ${order.userInfo.postalCode}</td></tr>
              </table>
            </div>

            <div style="margin-bottom: 40px;">
              <div style="font-size: 14px; font-weight: 700; color: #111827; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 16px; border-bottom: 2px solid #F1E8DD; padding-bottom: 8px;">Order Summary</div>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width: 100%; border-collapse: collapse;">
                ${itemsRows}
              </table>
            </div>

            <div style="background: #111827; border-radius: 16px; padding: 30px; color: #FFFFFF;">
              <table role="presentation" style="width: 100%;">
                <tr>
                  <td style="font-size: 16px; color: #9CA3AF;">Total Amount</td>
                  <td style="font-size: 32px; font-weight: 700; text-align: right; color: #FFFFFF;">₹${formatINR(order.totalAmount)}</td>
                </tr>
                <tr>
                  <td colspan="2" style="padding-top: 15px; border-top: 1px solid #374151; margin-top: 15px; font-size: 12px; color: #9CA3AF;">
                    Payment ID: <span style="font-family: monospace;">${order.razorpayPaymentId || "N/A"}</span>
                  </td>
                </tr>
              </table>
            </div>
            

          </div>

          <div style="padding: 30px; background: #FBF8F3; text-align: center; border-top: 1px solid #F1E8DD;">
            <div style="font-size: 12px; color: #9CA3AF; letter-spacing: 0.1em;">© 2026 KHUSHI CHAUHAN DESIGNER STUDIO</div>
          </div>
        </div>
      </body>
      </html>
    `;

    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM || "Khushi Chauhan Designer Studio <onboarding@resend.dev>",
      to: adminRecipients,
      subject: `New Order Alert • #${order._id.toString().slice(-6).toUpperCase()}`,
      html: emailBody,
    });

    if (error) {
      console.error("Resend Admin Email Error:", error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Admin Email Exception:", error);
    return false;
  }
};

export const sendCustomerEmail = async (order) => {
  try {
    if (!order.userInfo?.email) return false;

    const itemsRows = (order.items || [])
      .map(
        (item) => `
          <tr style="border-bottom: 1px solid #F1E8DD;">
            <td style="padding: 20px 0; vertical-align: top;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
                <tr>
                  <td style="width: 100px; padding-right: 20px; vertical-align: top;">
                    ${
                      item.image
                        ? `<img src="${item.image}" alt="${item.name}" width="100" height="125" style="display:block;border-radius:12px;object-fit:cover;border:1px solid #E7DFD3;" />`
                        : `<div style="width:100px;height:125px;border-radius:12px;background:#FBF8F3;border:1px solid #E7DFD3;"></div>`
                    }
                  </td>
                  <td style="vertical-align: top; padding-top: 8px;">
                    <div style="font-size: 16px; font-weight: 700; color: #111827; margin-bottom: 6px; line-height: 1.4;">${item.name}</div>
                    <div style="font-size: 14px; color: #6B7280;">Quantity: <span style="font-weight: 600; color: #111827;">${item.quantity}</span></div>
                  </td>
                </tr>
              </table>
            </td>
            <td style="padding: 20px 0; font-size: 16px; font-weight: 700; color: #111827; text-align: right; vertical-align: top; padding-top: 28px;">
              ₹${formatINR((item.quantity || 0) * (item.price || 0))}
            </td>
          </tr>`
      )
      .join("");

    const estStart = new Date(); estStart.setDate(estStart.getDate() + 7);
    const estEnd = new Date(); estEnd.setDate(estEnd.getDate() + 10);
    const formatDate = (d) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

    const emailBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          @media only screen and (max-width: 620px) {
            .container { width: 100% !important; margin: 0 !important; border-radius: 0 !important; }
            .content { padding: 20px !important; }
          }
        </style>
      </head>
      <body style="${commonStyles}">
        <div class="container" style="${cardStyles}">
          <div style="${headerStyles}">
            <img src="https://pub-141831e61e69445289222976a15b6fb3.r2.dev/Image_to_url_V2/logo-imagetourl.cloud-1773202506998-lijpc5.png" alt="Logo" style="${logoStyles}" />
            <div style="${brandTextStyles}">ORDER CONFIRMED</div>
          </div>

          <div class="content" style="padding: 40px 30px;">
            <div style="text-align: center; margin-bottom: 35px;">
              <h1 style="font-size: 24px; font-weight: 700; color: #111827; margin: 0 0 12px 0;">Thank you for your order, ${order.userInfo.name.split(' ')[0]}!</h1>
              <p style="font-size: 16px; color: #6B7280; line-height: 1.6; margin: 0;">We've received your request and our artisans are beginning to craft your selection.</p>
            </div>

            <div style="display: flex; gap: 15px; margin-bottom: 35px; flex-wrap: wrap;">
              <div style="flex: 1; min-width: 200px; padding: 20px; background: #FBF8F3; border-radius: 12px; border: 1px solid #E7DFD3;">
                <div style="font-size: 11px; color: #9A7B4F; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 6px;">Order Number</div>
                <div style="font-size: 16px; font-weight: 700; color: #111827; font-family: monospace;">#${order._id.toString().toUpperCase()}</div>
              </div>
              <div style="flex: 1; min-width: 200px; padding: 20px; background: #FBF8F3; border-radius: 12px; border: 1px solid #E7DFD3;">
                <div style="font-size: 11px; color: #9A7B4F; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 6px;">Expected Delivery</div>
                <div style="font-size: 16px; font-weight: 700; color: #111827;">${formatDate(estStart)} - ${formatDate(estEnd)}</div>
              </div>
            </div>

            <div style="margin-bottom: 40px;">
              <div style="font-size: 14px; font-weight: 700; color: #111827; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 16px; border-bottom: 2px solid #F1E8DD; padding-bottom: 8px;">Shipping Address</div>
              <div style="font-size: 15px; color: #4B5563; line-height: 1.7;">
                <strong style="color: #111827;">${order.userInfo.name}</strong><br>
                ${order.userInfo.address}<br>
                ${order.userInfo.city}, ${order.userInfo.state} - ${order.userInfo.postalCode}<br>
                ${order.userInfo.country}
              </div>
            </div>

            <div style="margin-bottom: 40px;">
              <div style="font-size: 14px; font-weight: 700; color: #111827; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 16px; border-bottom: 2px solid #F1E8DD; padding-bottom: 8px;">Order Details</div>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width: 100%; border-collapse: collapse;">
                ${itemsRows}
                <tr>
                  <td style="padding: 25px 0 0 0; font-size: 18px; font-weight: 700; color: #111827;">Total Paid</td>
                  <td style="padding: 25px 0 0 0; font-size: 22px; font-weight: 700; color: #111827; text-align: right;">₹${formatINR(order.totalAmount)}</td>
                </tr>
              </table>
            </div>

            <div style="padding: 25px; border: 1px dashed #E7DFD3; border-radius: 16px; text-align: center;">
              <div style="font-size: 15px; font-weight: 700; color: #111827; margin-bottom: 8px;">Need Assistance?</div>
              <div style="font-size: 14px; color: #6B7280; line-height: 1.6;">Our support team is here for you. Reply to this email or reach out at <a href="mailto:info@khushichauhandesignerstudio.com" style="color: #9A7B4F; text-decoration: none; font-weight: 600;">info@khushichauhandesignerstudio.com</a></div>
            </div>
          </div>

          <div style="padding: 30px; background: #FBF8F3; text-align: center; border-top: 1px solid #F1E8DD;">
            <div style="font-size: 12px; color: #9CA3AF; letter-spacing: 0.1em; margin-bottom: 8px;">© 2026 KHUSHI CHAUHAN DESIGNER STUDIO</div>
            <div style="font-size: 11px; color: #D1D5DB;">Handcrafted Luxury • Minimalist Design</div>
          </div>
        </div>
      </body>
      </html>
    `;

    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM || "Khushi Chauhan Designer Studio <onboarding@resend.dev>",
      to: [order.userInfo.email],
      subject: "Your order has been received • Khushi Chauhan Designer Studio",
      html: emailBody,
    });

    return !error;
  } catch (error) {
    console.error("Customer Email Error:", error);
    return false;
  }
};

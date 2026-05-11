// functions/sendOrderConfirmation.js
const functions = require('firebase-functions');
const nodemailer = require('nodemailer');

// Configure email transporter (use your email service)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: functions.config().email.user,
    pass: functions.config().email.password,
  },
});

exports.sendOrderConfirmation = functions.https.onCall(async (data, context) => {
  const { to, name, orderId, totalAmount, pickupLocation, downloadLink } = data;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #5A3E2B; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; padding: 12px 24px; background: #5A3E2B; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Humanity Haven Foundation</h2>
          <p>Order Confirmation</p>
        </div>
        <div class="content">
          <p>Dear ${name},</p>
          <p>Thank you for your support! Your order has been confirmed and is ready for pickup.</p>
          
          <h3>Order Details:</h3>
          <ul>
            <li><strong>Order ID:</strong> ${orderId}</li>
            <li><strong>Total Amount:</strong> Ksh ${totalAmount.toLocaleString()}</li>
            <li><strong>Pickup Location:</strong> ${pickupLocation}</li>
          </ul>
          
          <p>Click the button below to download your pickup pass:</p>
          <div style="text-align: center;">
            <a href="${downloadLink}" class="button">Download Your Pass</a>
          </div>
          
          <p><strong>Important:</strong> You will need to present this pass (digital or printed) at the pickup location for confirmation and identity purposes.</p>
          
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all;"><small>${downloadLink}</small></p>
        </div>
        <div class="footer">
          <p>Humanity Haven Foundation - Empowering lives, restoring hope</p>
          <p>Questions? Contact us at support@humanityhaven.org</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: '"Humanity Haven Foundation" <noreply@humanityhaven.org>',
    to: to,
    subject: `Your Pickup Pass - Order ${orderId}`,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send email');
  }
});
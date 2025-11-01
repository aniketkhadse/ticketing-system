const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (to, subject, html) => {
  const msg = {
    to,
    from: process.env.SENDGRID_FROM_EMAIL, // Must be verified in SendGrid
    subject,
    html,
  };

  try {
    await sgMail.send(msg);
  } catch (error) {
    console.error("SendGrid Error:", error);
    throw error;
  }
};

const sendOTPEmail = async (email, otp) => {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
        <h2 style="color: #333;">Email Verification</h2>
        <p>Your OTP for email verification is:</p>
        <h1 style="color: #4CAF50; font-size: 36px; letter-spacing: 5px;">${otp}</h1>
        <p>This OTP will expire in 10 minutes.</p>
        <p style="color: #666; font-size: 12px;">If you didn't request this, please ignore this email.</p>
      </div>
    </div>
  `;
  await sendEmail(email, "Email Verification - OTP", html);
};

const sendPasswordResetEmail = async (email, resetToken) => {
  const resetLink = `https://ticketing-system-cyan.vercel.app/reset-password/${resetToken}`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>Click the button below to reset your password:</p>
        <a href="${resetLink}" style="display: inline-block; padding: 12px 30px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
        <p>Or copy this link: ${resetLink}</p>
        <p>This link will expire in 1 hour.</p>
      </div>
    </div>
  `;
  await sendEmail(email, "Password Reset Request", html);
};

const sendNewTicketEmail = async (adminEmail, ticketData) => {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
        <h2 style="color: #333;">🎫 New Ticket Submitted</h2>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Ticket ID:</strong></td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${ticketData.ticketId}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>From:</strong></td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${ticketData.userName}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Folder Path:</strong></td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${ticketData.folderPath}</td>
          </tr>
        </table>
        <a href="https://ticketing-system-cyan.vercel.app/admin" style="display: inline-block; padding: 12px 30px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 5px;">View in Admin Panel</a>
      </div>
    </div>
  `;
  await sendEmail(adminEmail, `New Ticket - ${ticketData.ticketId}`, html);
};

const sendTicketStatusEmail = async (userEmail, ticketData) => {
  const statusColor = ticketData.status === "solved" ? "#4CAF50" : "#f44336";
  const statusText = ticketData.status === "solved" ? "✅ Solved" : "❌ Error";
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
        <h2 style="color: #333;">Ticket Status Updated</h2>
        <div style="background-color: ${statusColor}; color: white; padding: 15px; border-radius: 5px; text-align: center;">
          <h3 style="margin: 0;">${statusText}</h3>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 10px;"><strong>Ticket ID:</strong></td>
            <td style="padding: 10px;">${ticketData.ticketId}</td>
          </tr>
          ${
            ticketData.adminComment
              ? `<tr><td style="padding: 10px;"><strong>Comment:</strong></td><td style="padding: 10px;">${ticketData.adminComment}</td></tr>`
              : ""
          }
        </table>
      </div>
    </div>
  `;
  await sendEmail(
    userEmail,
    `Ticket ${ticketData.ticketId} - Status Updated`,
    html
  );
};

module.exports = {
  sendOTPEmail,
  sendPasswordResetEmail,
  sendNewTicketEmail,
  sendTicketStatusEmail,
};

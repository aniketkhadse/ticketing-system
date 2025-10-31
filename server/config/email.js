const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Email Verification - OTP',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
          <h2 style="color: #333;">Email Verification</h2>
          <p>Your OTP for email verification is:</p>
          <h1 style="color: #4CAF50; font-size: 36px; letter-spacing: 5px;">${otp}</h1>
          <p>This OTP will expire in 10 minutes.</p>
          <p style="color: #666; font-size: 12px;">If you didn't request this, please ignore this email.</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

const sendPasswordResetEmail = async (email, resetToken) => {
  const resetLink = `https://ticketing-system-cyan.vercel.app/reset-password/${resetToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Click the button below to reset your password:</p>
          <a href="${resetLink}" style="display: inline-block; padding: 12px 30px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
          <p>Or copy this link: ${resetLink}</p>
          <p>This link will expire in 1 hour.</p>
          <p style="color: #666; font-size: 12px;">If you didn't request this, please ignore this email.</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

const sendNewTicketEmail = async (adminEmail, ticketData) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: adminEmail,
    subject: `New Ticket Submitted - ${ticketData.ticketId}`,
    html: `
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
              <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Email:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${ticketData.userEmail}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Folder Path:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; word-break: break-all;">${ticketData.folderPath}</td>
            </tr>
            <tr>
              <td style="padding: 10px; vertical-align: top;"><strong>Query:</strong></td>
              <td style="padding: 10px;">${ticketData.query}</td>
            </tr>
          </table>
          <a href="https://ticketing-system-cyan.vercel.app/admin" style="display: inline-block; padding: 12px 30px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px;">View in Admin Panel</a>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

const sendTicketStatusEmail = async (userEmail, ticketData) => {
  const statusColor = ticketData.status === 'solved' ? '#4CAF50' : '#f44336';
  const statusText = ticketData.status === 'solved' ? '✅ Solved' : '❌ Error';
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: `Ticket ${ticketData.ticketId} - Status Updated`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
          <h2 style="color: #333;">Ticket Status Updated</h2>
          <div style="background-color: ${statusColor}; color: white; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
            <h3 style="margin: 0;">${statusText}</h3>
          </div>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Ticket ID:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${ticketData.ticketId}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Folder Path:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; word-break: break-all;">${ticketData.folderPath}</td>
            </tr>
            ${ticketData.adminComment ? `
            <tr>
              <td style="padding: 10px; vertical-align: top;"><strong>Admin Comment:</strong></td>
              <td style="padding: 10px;">${ticketData.adminComment}</td>
            </tr>
            ` : ''}
          </table>
          <a href="https://ticketing-system-cyan.vercel.app/dashboard" style="display: inline-block; padding: 12px 30px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px;">View Ticket</a>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendOTPEmail,
  sendPasswordResetEmail,
  sendNewTicketEmail,
  sendTicketStatusEmail,
};
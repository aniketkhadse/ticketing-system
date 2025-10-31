const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendOTPEmail, sendPasswordResetEmail } = require('../config/email');

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Register User
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log('📝 Registration attempt:', { name, email });

    // Validate email domain
    if (!email.endsWith('@aristasystems.in')) {
      console.log('❌ Invalid email domain:', email);
      return res.status(400).json({ message: 'Email must be from @aristasystems.in domain' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ User already exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    console.log('🔑 Generated OTP:', otp);

    // Create user
    const user = new User({
      name,
      email,
      password,
      otp: {
        code: otp,
        expiresAt: otpExpires,
      },
    });

    await user.save();
    console.log('✅ User saved to database');

    // Send OTP email
    try {
      await sendOTPEmail(email, otp);
      console.log('✅ OTP email sent successfully');
    } catch (emailError) {
      console.error('❌ Failed to send OTP email:', emailError);
      // Continue even if email fails - user can resend OTP
    }

    res.status(201).json({ 
      message: 'Registration successful. Please verify your email with the OTP sent.',
      userId: user._id 
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { userId, otp } = req.body;

    console.log('🔍 OTP verification attempt:', { userId, otp });

    const user = await User.findById(userId);
    if (!user) {
      console.log('❌ User not found:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      console.log('⚠️ Email already verified:', user.email);
      return res.status(400).json({ message: 'Email already verified' });
    }

    console.log('📋 Stored OTP:', user.otp.code, 'Provided OTP:', otp);

    if (user.otp.code !== otp) {
      console.log('❌ Invalid OTP');
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (new Date() > user.otp.expiresAt) {
      console.log('❌ OTP expired');
      return res.status(400).json({ message: 'OTP has expired' });
    }

    user.isVerified = true;
    user.otp = undefined;
    await user.save();

    console.log('✅ Email verified successfully:', user.email);

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('❌ OTP verification error:', error);
    res.status(500).json({ message: 'Verification failed', error: error.message });
  }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
  try {
    const { userId } = req.body;

    console.log('🔄 Resend OTP attempt:', userId);

    const user = await User.findById(userId);
    if (!user) {
      console.log('❌ User not found:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      console.log('⚠️ Email already verified:', user.email);
      return res.status(400).json({ message: 'Email already verified' });
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    console.log('🔑 New OTP generated:', otp);

    user.otp = {
      code: otp,
      expiresAt: otpExpires,
    };
    await user.save();

    try {
      await sendOTPEmail(user.email, otp);
      console.log('✅ OTP resent successfully');
    } catch (emailError) {
      console.error('❌ Failed to resend OTP email:', emailError);
    }

    res.json({ message: 'OTP resent successfully' });
  } catch (error) {
    console.error('❌ Resend OTP error:', error);
    res.status(500).json({ message: 'Failed to resend OTP', error: error.message });
  }
});

// User Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Login attempt:', email);

    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('👤 User found:', { email: user.email, isVerified: user.isVerified });

    if (!user.isVerified) {
      console.log('⚠️ User not verified:', email);
      return res.status(401).json({ 
        message: 'Please verify your email first', 
        userId: user._id,
        needsVerification: true 
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.log('❌ Invalid password for:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ Login successful:', email);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// Admin Login
router.post('/admin-login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Admin login attempt:', email);

    if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
      console.log('❌ Invalid admin credentials');
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    const token = jwt.sign(
      { email, isAdmin: true },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ Admin login successful');

    res.json({
      token,
      admin: {
        email,
        isAdmin: true,
      },
    });
  } catch (error) {
    console.error('❌ Admin login error:', error);
    res.status(500).json({ message: 'Admin login failed', error: error.message });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    console.log('🔑 Forgot password request:', email);

    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    try {
      await sendPasswordResetEmail(email, resetToken);
      console.log('✅ Password reset email sent');
    } catch (emailError) {
      console.error('❌ Failed to send reset email:', emailError);
    }

    res.json({ message: 'Password reset link sent to your email' });
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({ message: 'Failed to send reset link', error: error.message });
  }
});

// Reset Password
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { password } = req.body;
    const resetToken = req.params.token;

    console.log('🔄 Password reset attempt with token');

    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      console.log('❌ Invalid or expired token');
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    console.log('✅ Password reset successful:', user.email);

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('❌ Reset password error:', error);
    res.status(500).json({ message: 'Failed to reset password', error: error.message });
  }
});

module.exports = router;
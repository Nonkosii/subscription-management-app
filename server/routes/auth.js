import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { otpRateLimiter } from '../middleware/rateLimit.js';

const router = Router();
const OTP_STORE = {}; // in-memory OTP store

// Send OTP (mock) with rate limiting
router.post('/send-otp', otpRateLimiter, (req, res) => {
  const { msisdn } = req.body;
  
  // Validate input
  if (!msisdn) {
    return res.status(400).json({ message: 'MSISDN is required' });
  }
  
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  OTP_STORE[msisdn] = otp;
  console.log(`OTP for ${msisdn}: ${otp}`);
  
  res.json({ message: 'OTP sent (mocked)' });
});

// Verify OTP
router.post('/verify-otp', (req, res) => {
  const { msisdn, otp } = req.body;
  
  // Validate input
  if (!msisdn || !otp) {
    return res.status(400).json({ message: 'MSISDN and OTP are required' });
  }
  
  if (OTP_STORE[msisdn] === otp) {
    const token = jwt.sign({ msisdn }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '1h' });
    delete OTP_STORE[msisdn];
    res.json({ token });
  } else {
    res.status(400).json({ message: 'Invalid OTP' });
  }
});

export default router;
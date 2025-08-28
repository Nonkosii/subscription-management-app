import rateLimit from 'express-rate-limit';

// 3 attempts per 15 minutes
export const otpRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 OTP requests
  message: {
    error: "Too many OTP requests, please try again after 15 minutes"
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      message: "Too many OTP requests. Please try again in 15 minutes."
    });
  }
});

export default { otpRateLimiter };
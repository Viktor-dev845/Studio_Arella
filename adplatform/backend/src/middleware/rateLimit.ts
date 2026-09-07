import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

// Guards short-code guessing (password reset codes, email verification OTPs)
// where the code space is small enough (~9000 values) that unlimited attempts
// make brute force practical well inside the code's validity window.
export const otpGuessLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please wait a few minutes and try again.' },
});

// Guards triggering password-reset emails / OTP sends.
export const otpRequestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please wait a while before trying again.' },
});

// Guards credential stuffing / brute-force login and registration spam.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please wait a few minutes and try again.' },
});

// Guards cost-abuse against the AI chat endpoint (keyed per authenticated
// user rather than per IP, since it only ever runs behind `authenticate`).
export const chatLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: any) => req.user?.id || ipKeyGenerator(req.ip),
  message: { message: 'You are sending messages too quickly. Please slow down.' },
});


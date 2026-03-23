import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User } from '../models/User';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../config/jwt.config';
import { ApiError } from '../utils/ApiError';
import { asyncWrapper } from '../utils/asyncWrapper';
import { emailService } from '../services/EmailService';
import { env } from '../config/env';
import { AuthRequest } from '../middleware/authMiddleware';

// In-memory OTP store (use Redis in production)
const otpStore = new Map<string, { otp: string; expires: number }>();

export const register = asyncWrapper(async (req: Request, res: Response) => {
  const { username, email, password, role, institution } = req.body;

  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    throw existingUser.email === email
      ? ApiError.conflict('Email already registered')
      : ApiError.conflict('Username already taken');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    username,
    email,
    passwordHash,
    role: role === 'TEACHER' ? 'TEACHER' : 'STUDENT',
    profile: { institution },
  });

  const payload = { userId: user._id.toString(), role: user.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  user.refreshTokens.push(refreshToken);
  await user.save();

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // Non-blocking welcome email
  emailService.sendWelcome(email, username).catch(console.error);

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: { user, accessToken },
  });
});

export const login = asyncWrapper(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+passwordHash +refreshTokens');
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (!user.isActive) {
    throw ApiError.forbidden('Account has been suspended');
  }

  const payload = { userId: user._id.toString(), role: user.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Keep max 5 refresh tokens per user
  user.refreshTokens = [...user.refreshTokens.slice(-4), refreshToken];
  await user.save();

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    success: true,
    data: { user, accessToken },
  });
});

export const logout = asyncWrapper(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;

  if (token) {
    await User.updateOne(
      { refreshTokens: token },
      { $pull: { refreshTokens: token } }
    );
  }

  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Logged out successfully' });
});

export const refresh = asyncWrapper(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;
  if (!token) throw ApiError.unauthorized('No refresh token');

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw ApiError.unauthorized('Invalid refresh token');
  }

  const user = await User.findById(payload.userId).select('+refreshTokens');
  if (!user || !user.refreshTokens.includes(token)) {
    throw ApiError.unauthorized('Refresh token reuse detected');
  }

  // Rotate refresh token
  const newAccess = generateAccessToken({ userId: user._id.toString(), role: user.role });
  const newRefresh = generateRefreshToken({ userId: user._id.toString(), role: user.role });

  user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
  user.refreshTokens.push(newRefresh);
  await user.save();

  res.cookie('refreshToken', newRefresh, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ success: true, data: { accessToken: newAccess } });
});

export const forgotPassword = asyncWrapper(async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  // Always return 200 to prevent email enumeration
  if (!user) {
    res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
    return;
  }

  const otp = crypto.randomBytes(32).toString('hex');
  otpStore.set(email, { otp, expires: Date.now() + 15 * 60 * 1000 });

  const resetUrl = `${env.CLIENT_URL}/reset-password?token=${otp}&email=${encodeURIComponent(email)}`;
  await emailService.sendPasswordReset(email, resetUrl);

  res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
});

export const resetPassword = asyncWrapper(async (req: Request, res: Response) => {
  const { email, token, password } = req.body;

  const stored = otpStore.get(email);
  if (!stored || stored.otp !== token || Date.now() > stored.expires) {
    throw ApiError.badRequest('Invalid or expired reset token');
  }

  const user = await User.findOne({ email });
  if (!user) throw ApiError.notFound('User not found');

  user.passwordHash = await bcrypt.hash(password, 12);
  user.refreshTokens = []; // Invalidate all sessions
  await user.save();

  otpStore.delete(email);
  res.json({ success: true, message: 'Password reset successfully' });
});

export const getMe = asyncWrapper(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user?.userId);
  if (!user) throw ApiError.notFound('User not found');
  res.json({ success: true, data: { user } });
});

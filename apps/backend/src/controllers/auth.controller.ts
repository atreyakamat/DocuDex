import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import * as authService from '../services/auth.service';
import { AuthRequest } from '../middleware/auth';

export const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('fullName').trim().notEmpty().isLength({ min: 2, max: 100 }),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/),
  body('phone').optional().isMobilePhone('any'),
];

export const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, error: 'Validation failed', details: errors.array() });
      return;
    }
    const result = await authService.registerUser(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, error: 'Validation failed', details: errors.array() });
      return;
    }
    const result = await authService.loginUser(req.body);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function verifyMfaLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { mfaToken, code } = req.body;
    if (!mfaToken || !code) {
      res.status(400).json({ success: false, error: 'mfaToken and code are required' });
      return;
    }
    const result = await authService.verifyMfaLogin(mfaToken, code);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function setupMFA(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await authService.setupMFA(req.user!.userId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function verifyMFASetup(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { code } = req.body;
    if (!code) {
      res.status(400).json({ success: false, error: 'code is required' });
      return;
    }
    const user = await authService.verifyMFASetup(req.user!.userId, code);
    res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
}

export async function disableMFA(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await authService.disableMFA(req.user!.userId);
    res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ success: false, error: 'Refresh token required' });
      return;
    }
    const result = await authService.refreshAccessToken(refreshToken);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await authService.logoutUser(refreshToken);
    }
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
}

export async function me(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await authService.getUserById(req.user!.userId);
    res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await authService.updateProfile(req.user!.userId, req.body);
    res.json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
}

export async function changePassword(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, error: 'currentPassword and newPassword are required' });
      return;
    }
    await authService.changePassword(req.user!.userId, currentPassword, newPassword);
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
}

export async function sendVerificationOtp(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const otp = await authService.generateEmailOtp(req.user!.userId);
    // In production, send OTP via SMTP/SMS; for dev, return it in response
    const isDev = process.env.NODE_ENV === 'development';
    res.status(200).json({
      success: true,
      message: 'OTP sent',
      ...(isDev && { otp }),
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyOtp(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { otp } = req.body;
    await authService.verifyEmailOtp(req.user!.userId, otp);
    res.status(200).json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    next(error);
  }
}

import { Router } from 'express';
import {
  register,
  login,
  verifyMfaLogin,
  setupMFA,
  verifyMFASetup,
  disableMFA,
  refresh,
  logout,
  me,
  updateProfile,
  changePassword,
  sendVerificationOtp,
  verifyOtp,
  registerValidation,
  loginValidation,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/login/mfa', verifyMfaLogin);

// MFA Setup
router.post('/mfa/setup', authenticate, setupMFA);
router.post('/mfa/verify', authenticate, verifyMFASetup);
router.post('/mfa/disable', authenticate, disableMFA);

router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', authenticate, me);
router.put('/profile', authenticate, updateProfile);
router.post('/change-password', authenticate, changePassword);
router.post('/verify/send', authenticate, sendVerificationOtp);
router.post('/verify/confirm', authenticate, verifyOtp);

export default router;

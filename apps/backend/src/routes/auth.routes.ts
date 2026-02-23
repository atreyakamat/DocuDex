import { Router } from 'express';
import {
  register,
  login,
  refresh,
  logout,
  me,
  sendVerificationOtp,
  verifyOtp,
  registerValidation,
  loginValidation,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', authenticate, me);
router.post('/verify/send', authenticate, sendVerificationOtp);
router.post('/verify/confirm', authenticate, verifyOtp);

export default router;

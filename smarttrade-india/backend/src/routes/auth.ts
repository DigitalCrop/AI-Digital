import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as authService from '../services/authService';
import { authRateLimiter } from '../middleware/rateLimiter';
import { authenticate } from '../middleware/auth';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  totpCode: z.string().optional(),
});

router.post('/register', authRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = registerSchema.parse(req.body);
    const result = await authService.registerUser(data);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.post('/login', authRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = loginSchema.parse(req.body);
    const result = await authService.loginUser(
      data.email,
      data.password,
      data.totpCode,
      req.ip,
      req.headers['user-agent']
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.getUserById(req.user!.userId);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

router.put('/profile', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.updateProfile(req.user!.userId, req.body);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

router.post('/2fa/setup', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.setup2FA(req.user!.userId);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.post('/2fa/enable', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await authService.enable2FA(req.user!.userId, req.body.token);
    res.json({ success: true, data: { enabled: true } });
  } catch (error) {
    next(error);
  }
});

export default router;

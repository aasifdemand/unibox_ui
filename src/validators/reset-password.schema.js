import { z } from 'zod';

export const resetPasswordSchema = z.object({
  email: z.string().email('Email is invalid'),
  otp: z.string().regex(/^\d{6}$/, 'OTP must be 6 digits'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

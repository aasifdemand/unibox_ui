import { z } from 'zod';

export const signupSchema = z
  .object({
    name: z.string().min(1, 'Name is required').min(2, 'Name must be at least 2 characters'),

    email: z.string().min(1, 'Email is required').email('Email is invalid'),

    password: z.string().min(8, 'Password must be at least 8 characters'),

    acceptTerms: z.literal(true, {
      errorMap: () => ({
        message: 'You must accept the terms and conditions',
      }),
    }),
  });

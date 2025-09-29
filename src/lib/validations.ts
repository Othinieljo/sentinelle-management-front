// Validation Schemas - SENTINELLE
import { z } from 'zod';

// Phone number validation (international format)
export const phoneSchema = z
  .string()
  .min(1, 'Le numéro de téléphone est requis')
  .regex(/^(\+33|0)[1-9](\d{8})$/, 'Format de numéro de téléphone invalide');

// Password validation
export const passwordSchema = z
  .string()
  .min(1, 'Le mot de passe est requis')
  .min(6, 'Le mot de passe doit contenir au moins 6 caractères');

// Login form validation
export const loginSchema = z.object({
  phone: phoneSchema,
  password: passwordSchema,
});

// User profile validation
export const userProfileSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100, 'Le nom est trop long'),
  email: z.string().email('Format d\'email invalide').optional().or(z.literal('')),
});

// Campaign validation
export const campaignSchema = z.object({
  title: z.string().min(1, 'Le titre est requis').max(100, 'Le titre est trop long'),
  description: z.string().min(1, 'La description est requise').max(500, 'La description est trop longue'),
  targetAmount: z.number().min(1, 'Le montant cible doit être positif'),
  startDate: z.date(),
  endDate: z.date(),
  isActive: z.boolean().default(true),
});

// Payment validation
export const paymentSchema = z.object({
  amount: z.number().min(1, 'Le montant doit être positif'),
  campaignId: z.string().min(1, 'La campagne est requise'),
  paymentMethod: z.enum(['card', 'bank_transfer', 'mobile_money']),
});

// Wheel spin validation
export const wheelSpinSchema = z.object({
  campaignId: z.string().min(1, 'La campagne est requise'),
});

// Admin user creation validation
export const createUserSchema = z.object({
  phone: phoneSchema,
  name: z.string().min(1, 'Le nom est requis').max(100, 'Le nom est trop long'),
  email: z.string().email('Format d\'email invalide').optional().or(z.literal('')),
  role: z.enum(['member', 'admin']).default('member'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

// Admin user update validation
export const updateUserSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100, 'Le nom est trop long'),
  email: z.string().email('Format d\'email invalide').optional().or(z.literal('')),
  role: z.enum(['member', 'admin']).optional(),
  isActive: z.boolean().optional(),
});

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>;
export type UserProfileData = z.infer<typeof userProfileSchema>;
export type CampaignData = z.infer<typeof campaignSchema>;
export type PaymentData = z.infer<typeof paymentSchema>;
export type WheelSpinData = z.infer<typeof wheelSpinSchema>;
export type CreateUserData = z.infer<typeof createUserSchema>;
export type UpdateUserData = z.infer<typeof updateUserSchema>;

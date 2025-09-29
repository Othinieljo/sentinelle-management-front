// Formulaire de connexion moderne et mobile-first - VERSION CORRIGÉE
'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Phone, Lock, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/lib/auth/auth-store';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card/Card';
import { SentinelleLogo } from '@/components/common/SentinelleLogo';

// Schéma de validation
const loginSchema = z.object({
  phone_number: z
    .string()
    .min(1, 'Le numéro de téléphone est requis')
    .regex(/^0[1-9](\s?\d{2}){4}$/, 'Format de numéro invalide (10 chiffres commençant par 0)'),
  password: z
    .string()
    .min(1, 'Le mot de passe est requis')
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  remember_me: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginForm: React.FC = () => {
  const { login, isLoading, error, clearError, user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsSubmitting(true);
      clearError();
      
      // Nettoyer le numéro et le convertir en format international
      const cleanPhone = data.phone_number.replace(/\s/g, '');
      // const formattedPhone = `+33${cleanPhone.slice(1)}`;

      await login({
        phone_number: cleanPhone,
        password: data.password,
      });
      
      // Vérifier l'état d'authentification après la connexion
      console.log('Login successful, checking auth state...');
      
      // Redirection manuelle après connexion réussie
      // Utiliser l'état de l'auth store directement
      const { user: currentUser } = useAuthStore.getState();
      console.log('Current user after login:', currentUser);
      
      setTimeout(() => {
        if (currentUser?.role === 'admin') {
          console.log('Redirecting to admin dashboard...');
          router.push('/admin');
        } else {
          console.log('Redirecting to member dashboard...');
          router.push('/member');
        }
      }, 500); // Délai réduit
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.startsWith('0') && cleaned.length <= 10) {
      return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
    }
    return cleaned;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <SentinelleLogo size="lg" className="mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Bienvenue sur SENTINELLE
          </h1>
          <p className="text-gray-600">
            Connectez-vous pour accéder à votre espace
          </p>
        </motion.div>

        {/* Formulaire */}
        <Card className="shadow-xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-xl">Connexion</CardTitle>
            <CardDescription>
              Entrez vos identifiants pour accéder à votre compte
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Message d&apos;erreur global */}
              {error && (
                <motion.div
                  className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-sm text-red-700">{error}</span>
                </motion.div>
              )}

              {/* Numéro de téléphone */}
              <div>
                <Input
                  {...register('phone_number')}
                  label="Numéro de téléphone"
                  placeholder="0612345678"
                  leftIcon={<Phone className="w-4 h-4" />}
                  error={errors.phone_number?.message}
                  fullWidth
                  onChange={(e) => {
                    const formatted = formatPhoneNumber(e.target.value);
                    e.target.value = formatted;
                  }}
                />
              </div>

              {/* Mot de passe */}
              <div>
                <Input
                  {...register('password')}
                  type="password"
                  label="Mot de passe"
                  placeholder="Votre mot de passe"
                  leftIcon={<Lock className="w-4 h-4" />}
                  error={errors.password?.message}
                  fullWidth
                />
              </div>

              {/* Options */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    {...register('remember_me')}
                    type="checkbox"
                    className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    Se souvenir de moi
                  </span>
                </label>

                <button
                  type="button"
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                  Mot de passe oublié ?
                </button>
              </div>

              {/* Bouton de connexion */}
              <Button
                type="submit"
                variant="gradient"
                size="lg"
                fullWidth
                loading={isSubmitting || isLoading}
                disabled={!isValid || isSubmitting || isLoading}
                className="mt-8"
              >
                {isSubmitting || isLoading ? 'Connexion...' : 'Se connecter'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <motion.div
          className="text-center mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <p className="text-sm text-gray-600">
            Vous n&apos;avez pas de compte ?{' '}
            <button className="text-orange-600 hover:text-orange-700 font-medium">
              Contactez l&apos;administrateur
            </button>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginForm;
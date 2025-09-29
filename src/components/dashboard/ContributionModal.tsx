'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { CreditCard, Smartphone, Building2 } from 'lucide-react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Input, Card, CardContent } from '../ui';
import { Campaign } from '../../lib/api';
import { z } from 'zod';

const contributionSchema = z.object({
  amount: z.number().min(100, 'Le montant minimum est de 100 FCFA'),
  paymentMethod: z.enum(['card', 'bank_transfer', 'mobile_money']),
});

type ContributionFormData = z.infer<typeof contributionSchema>;

interface ContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: Campaign | null;
  onContribute: (data: ContributionFormData) => void;
}

const ContributionModal: React.FC<ContributionModalProps> = ({
  isOpen,
  onClose,
  campaign,
  onContribute,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'bank_transfer' | 'mobile_money'>('card');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ContributionFormData>({
    resolver: zodResolver(contributionSchema),
    defaultValues: {
      paymentMethod: 'card',
    },
  });

  const watchedAmount = watch('amount');

  const paymentMethods = [
    {
      id: 'card',
      name: 'Carte bancaire',
      icon: CreditCard,
      description: 'Paiement sécurisé par carte',
    },
    {
      id: 'bank_transfer',
      name: 'Virement bancaire',
      icon: Building2,
      description: 'Virement depuis votre compte',
    },
    {
      id: 'mobile_money',
      name: 'Mobile Money',
      icon: Smartphone,
      description: 'Orange Money, MTN Money, etc.',
    },
  ];

  const quickAmounts = [1000, 5000, 10000, 25000, 50000];

  const onSubmit = async (data: ContributionFormData) => {
    setIsSubmitting(true);
    try {
      await onContribute(data);
      onClose();
    } catch (error) {
      console.error('Erreur de contribution:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!campaign) return null;

  const progress = 0; // Pas de progression dans l'API actuelle
  const remainingAmount = 0; // Pas de montant restant dans l'API actuelle

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
    >
      <ModalHeader>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Contribuer à la campagne</h2>
          <p className="text-sm text-gray-600 mt-1">{campaign.name}</p>
        </div>
      </ModalHeader>

      <ModalBody>
        <div className="space-y-6">
          {/* Campaign info */}
          <Card variant="outlined">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-600">Progression</span>
                <span className="text-sm font-bold text-orange-600">
                  {progress.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                <div
                  className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>N/A FCFA collectés</span>
                <span>N/A FCFA objectif</span>
              </div>
            </CardContent>
          </Card>

          {/* Amount selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Montant de votre contribution
            </label>
            
            {/* Quick amounts */}
            <div className="grid grid-cols-5 gap-2 mb-4">
              {quickAmounts.map((amount) => (
                <motion.button
                  key={amount}
                  type="button"
                  className={`p-3 text-sm font-medium rounded-lg border-2 transition-all ${
                    watchedAmount === amount
                      ? 'border-orange-500 bg-orange-50 text-orange-600'
                      : 'border-gray-200 text-gray-600 hover:border-orange-300'
                  }`}
                  onClick={() => setValue('amount', amount)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {amount.toLocaleString()}
                </motion.button>
              ))}
            </div>

            {/* Custom amount */}
            <Input
              {...register('amount', { valueAsNumber: true })}
              type="number"
              placeholder="Montant personnalisé"
              error={errors.amount?.message}
            />
          </div>

          {/* Payment method selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Méthode de paiement
            </label>
            <div className="space-y-2">
              {paymentMethods.map((method) => (
                <motion.label
                  key={method.id}
                  className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedMethod === method.id
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <input
                    type="radio"
                    value={method.id}
                    checked={selectedMethod === method.id}
                    onChange={(e) => {
                      setSelectedMethod(e.target.value as 'card' | 'bank_transfer' | 'mobile_money');
                      setValue('paymentMethod', e.target.value as 'card' | 'bank_transfer' | 'mobile_money');
                    }}
                    className="sr-only"
                  />
                  <method.icon
                    size={24}
                    className={`mr-3 ${
                      selectedMethod === method.id ? 'text-orange-500' : 'text-gray-400'
                    }`}
                  />
                  <div>
                    <div className="font-medium text-gray-900">{method.name}</div>
                    <div className="text-sm text-gray-600">{method.description}</div>
                  </div>
                </motion.label>
              ))}
            </div>
          </div>

          {/* Contribution impact */}
          {watchedAmount && watchedAmount > 0 && (
            <motion.div
              className="bg-green-50 border border-green-200 rounded-xl p-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center space-x-2 text-green-700">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="font-medium">
                  Votre contribution de {watchedAmount.toLocaleString()} FCFA
                </span>
              </div>
              <p className="text-sm text-green-600 mt-1">
                {watchedAmount >= remainingAmount
                  ? 'Félicitations ! Vous atteignez l\'objectif de la campagne !'
                  : `Il reste ${(remainingAmount - watchedAmount).toLocaleString()} FCFA pour atteindre l'objectif.`}
              </p>
            </motion.div>
          )}
        </div>
      </ModalBody>

      <ModalFooter>
        <Button
          variant="secondary"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          variant="gradient"
          onClick={handleSubmit(onSubmit)}
          loading={isSubmitting}
          disabled={!watchedAmount || watchedAmount < 100}
        >
          Contribuer {watchedAmount ? `${watchedAmount.toLocaleString()} FCFA` : ''}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ContributionModal;

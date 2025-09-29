'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Target, Calendar, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardTitle, CardDescription } from '../ui';
import { Campaign } from '../../lib/api';

interface CampaignCardProps {
  campaign: Campaign;
  onContribute?: (campaign: Campaign) => void;
  className?: string;
}

const CampaignCard: React.FC<CampaignCardProps> = ({
  campaign,
  onContribute,
  className,
}) => {
  const progress = 0; // Pas de progression dans l'API actuelle
  const daysLeft = Math.ceil(
    (new Date(campaign.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const getProgressColor = () => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-orange-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusColor = () => {
    if (progress >= 100) return 'text-green-600 bg-green-50';
    if (campaign.is_active) return 'text-orange-600 bg-orange-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getStatusText = () => {
    if (progress >= 100) return 'Objectif atteint';
    if (campaign.is_active) return 'En cours';
    return 'Terminée';
  };

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        variant="elevated"
        className="h-full cursor-pointer"
        onClick={() => onContribute?.(campaign)}
      >
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <CardTitle className="text-lg mb-2">{campaign.name}</CardTitle>
              <CardDescription className="text-sm text-gray-600 line-clamp-2">
                {campaign.description}
              </CardDescription>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}
            >
              {getStatusText()}
            </span>
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Progression</span>
              <span className="font-medium">{progress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <motion.div
                className={`h-full ${getProgressColor()} rounded-full relative`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer" />
              </motion.div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <Target size={16} className="text-orange-500" />
              <div>
                <div className="text-sm text-gray-600">Objectif</div>
                <div className="font-semibold text-gray-900">
                  N/A
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp size={16} className="text-green-500" />
              <div>
                <div className="text-sm text-gray-600">Collecté</div>
                <div className="font-semibold text-gray-900">
                  N/A
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar size={14} />
              <span>
                {daysLeft > 0 ? `${daysLeft} jours restants` : 'Terminée'}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Users size={14} />
              <span>12 contributeurs</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CampaignCard;

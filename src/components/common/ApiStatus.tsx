'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { apiClient } from '../../lib/api';

interface ApiStatusProps {
  className?: string;
}

const ApiStatus: React.FC<ApiStatusProps> = ({ className = '' }) => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Ne pas vérifier l'API sur la page de login pour éviter les boucles
    if (typeof window !== 'undefined' && window.location.pathname.includes('/login')) {
      setStatus('error');
      setError('API non disponible sur la page de login');
      return;
    }

    const checkApiStatus = async () => {
      try {
        setStatus('checking');
        setError(null);
        
        // Essayer de récupérer les campagnes actives (endpoint simple)
        await apiClient.getActiveCampaigns();
        setStatus('connected');
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Erreur de connexion');
      }
    };

    checkApiStatus();
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'checking':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'checking':
        return 'Vérification de la connexion API...';
      case 'connected':
        return 'API connectée';
      case 'error':
        return `Erreur API: ${error}`;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'checking':
        return 'text-yellow-600';
      case 'connected':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
    }
  };

  return (
    <div className={`flex items-center space-x-2 text-sm ${className}`}>
      {getStatusIcon()}
      <span className={getStatusColor()}>
        {getStatusText()}
      </span>
    </div>
  );
};

export default ApiStatus;

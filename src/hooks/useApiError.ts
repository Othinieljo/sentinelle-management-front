import { useCallback } from 'react';
import { useToast } from './useToast';
import { ERROR_MESSAGES } from '../lib/config';

export const useApiError = () => {
  const { addToast } = useToast();

  const handleError = useCallback((error: unknown) => {
    console.error('API Error:', error);

    let message = ERROR_MESSAGES.UNKNOWN_ERROR;
    let title = 'Erreur';

    if (error instanceof Error) {
      // Erreurs de réseau
      if (error.message.includes('Network Error') || error.message.includes('fetch')) {
        message = ERROR_MESSAGES.NETWORK_ERROR;
        title = 'Connexion';
      }
      // Erreurs d'authentification
      else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        message = ERROR_MESSAGES.UNAUTHORIZED;
        title = 'Authentification';
      }
      // Erreurs de permissions
      else if (error.message.includes('403') || error.message.includes('Forbidden')) {
        message = ERROR_MESSAGES.FORBIDDEN;
        title = 'Permissions';
      }
      // Erreurs de validation
      else if (error.message.includes('422') || error.message.includes('Validation')) {
        message = ERROR_MESSAGES.VALIDATION_ERROR;
        title = 'Validation';
      }
      // Erreurs serveur
      else if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
        message = ERROR_MESSAGES.SERVER_ERROR;
        title = 'Serveur';
      }
      // Autres erreurs
      else {
        message = error.message;
      }
    }

    addToast({
      type: 'error',
      title,
      message,
    });
  }, [addToast]);

  return { handleError };
};

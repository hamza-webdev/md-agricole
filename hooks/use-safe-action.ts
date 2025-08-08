import { useCallback, useRef } from 'react';

/**
 * Hook pour gérer les actions de manière sécurisée et éviter les conflits
 */
export function useSafeAction() {
  const isProcessingRef = useRef(false);

  const safeAction = useCallback(async (action: () => void | Promise<void>) => {
    if (isProcessingRef.current) {
      return;
    }

    try {
      isProcessingRef.current = true;
      await action();
    } catch (error) {
      console.error('Erreur lors de l\'exécution de l\'action:', error);
    } finally {
      // Délai pour éviter les clics multiples rapides
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 100);
    }
  }, []);

  return safeAction;
}

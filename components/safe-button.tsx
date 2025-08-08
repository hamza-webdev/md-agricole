'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface SafeButtonProps {
  children: React.ReactNode;
  onClick?: () => void | Promise<void>;
  disabled?: boolean;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  type?: "button" | "submit" | "reset";
}

/**
 * Composant Button sécurisé qui évite les clics multiples et les problèmes d'événements
 */
export function SafeButton({ 
  children, 
  onClick, 
  disabled = false, 
  variant = "default",
  size = "default",
  className = "",
  type = "button",
  ...props 
}: SafeButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isProcessing || disabled || !onClick) {
      return;
    }

    try {
      setIsProcessing(true);
      await onClick();
    } catch (error) {
      console.error('Erreur lors du clic:', error);
    } finally {
      // Délai pour éviter les clics multiples rapides
      setTimeout(() => {
        setIsProcessing(false);
      }, 200);
    }
  };

  return (
    <Button
      type={type}
      variant={variant}
      size={size}
      className={`${className} force-pointer-events`}
      disabled={disabled || isProcessing}
      onClick={handleClick}
      style={{
        pointerEvents: (disabled || isProcessing) ? 'none' : 'auto',
        opacity: (disabled || isProcessing) ? 0.6 : 1
      }}
      {...props}
    >
      {children}
    </Button>
  );
}

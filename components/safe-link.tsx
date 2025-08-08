'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface SafeLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

/**
 * Composant Link sécurisé qui évite les problèmes de navigation
 */
export function SafeLink({ href, children, className, onClick }: SafeLinkProps) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (isNavigating) {
      e.preventDefault();
      return;
    }

    setIsNavigating(true);
    
    if (onClick) {
      onClick();
    }

    // Réinitialiser l'état après un délai
    setTimeout(() => {
      setIsNavigating(false);
    }, 1000);
  };

  return (
    <Link 
      href={href} 
      className={className}
      onClick={handleClick}
      style={{ 
        pointerEvents: isNavigating ? 'none' : 'auto',
        opacity: isNavigating ? 0.7 : 1 
      }}
    >
      {children}
    </Link>
  );
}

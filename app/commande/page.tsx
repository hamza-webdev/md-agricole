
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/use-cart';
import { OrderForm } from '@/components/order/order-form';
import { OrderSummary } from '@/components/order/order-summary';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function OrderPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { items, clearCart, getTotalPrice } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      toast.error('Vous devez être connecté pour passer une commande');
      router.push('/auth/connexion');
      return;
    }
    if (items?.length === 0) {
      toast.error('Votre panier est vide');
      router.push('/catalogue');
      return;
    }
  }, [session, status, items, router]);

  const handleOrderSubmit = async (orderData: any) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...orderData,
          items: items,
          totalAmount: getTotalPrice(),
        }),
      });

      if (response.ok) {
        const { orderId } = await response.json();
        clearCart();
        toast.success('Commande passée avec succès !');
        router.push(`/commande/confirmation/${orderId}`);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Erreur lors de la commande');
      }
    } catch (error) {
      toast.error('Erreur lors de la commande');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!session || items?.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link 
          href="/panier" 
          className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour au panier
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Finaliser la commande
        </h1>
        <p className="text-muted-foreground">
          Vérifiez vos informations et validez votre commande
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <OrderForm 
            onSubmit={handleOrderSubmit} 
            isSubmitting={isSubmitting}
            user={session.user}
          />
        </div>
        <div className="lg:col-span-1">
          <OrderSummary items={items} totalPrice={getTotalPrice()} />
        </div>
      </div>
    </div>
  );
}

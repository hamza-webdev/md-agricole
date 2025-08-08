
'use client';

import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { CartItem } from '@/hooks/use-cart';

interface OrderSummaryProps {
  items: CartItem[];
  totalPrice: number;
}

export function OrderSummary({ items, totalPrice }: OrderSummaryProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND'
    }).format(price);
  };

  return (
    <Card className="p-6 sticky top-24">
      <h2 className="text-xl font-semibold mb-6">Résumé de la commande</h2>
      
      <div className="space-y-4 mb-6">
        {items?.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <div className="relative w-12 h-12 bg-muted rounded-md overflow-hidden flex-shrink-0">
              {item.image && (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">{item.name}</h4>
              <p className="text-xs text-muted-foreground">
                Qté: {item.quantity}
              </p>
            </div>
            <div className="text-sm font-medium">
              {formatPrice(item.price * item.quantity)}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2 mb-6">
        <div className="flex justify-between text-sm">
          <span>Sous-total</span>
          <span>{formatPrice(totalPrice)}</span>
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Livraison</span>
          <span>Gratuite</span>
        </div>
        <div className="border-t pt-2">
          <div className="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span className="text-primary">{formatPrice(totalPrice)}</span>
          </div>
        </div>
      </div>

      <div className="text-xs text-muted-foreground space-y-1">
        <p>• Livraison gratuite dans toute la Tunisie</p>
        <p>• Garantie constructeur incluse</p>
        <p>• Support technique 24/7</p>
      </div>
    </Card>
  );
}

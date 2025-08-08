
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight } from 'lucide-react';
import { CartItem } from '@/hooks/use-cart';
import { motion } from 'framer-motion';

interface CartClientProps {
  items: CartItem[];
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  totalPrice: number;
}

export function CartClient({ 
  items, 
  updateQuantity, 
  removeItem, 
  clearCart, 
  totalPrice 
}: CartClientProps) {
  const [isClearing, setIsClearing] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND'
    }).format(price);
  };

  const handleClearCart = async () => {
    setIsClearing(true);
    clearCart();
    setTimeout(() => setIsClearing(false), 500);
  };

  if (items?.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingCart className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Votre panier est vide
        </h3>
        <p className="text-muted-foreground mb-8">
          Découvrez notre gamme de matériel agricole de qualité
        </p>
        <Link href="/catalogue">
          <Button size="lg">
            Parcourir le catalogue
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Articles du panier */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Articles ({items?.length || 0})
          </h2>
          {items?.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearCart}
              disabled={isClearing}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Vider le panier
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {items?.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="p-4">
                <div className="flex items-center gap-4">
                  {/* Image */}
                  <div className="relative w-20 h-20 bg-muted rounded-md overflow-hidden flex-shrink-0">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    )}
                  </div>

                  {/* Détails */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate">
                      {item.name}
                    </h3>
                    {(item.brand || item.model) && (
                      <p className="text-sm text-muted-foreground">
                        {item.brand} {item.model && `• ${item.model}`}
                      </p>
                    )}
                    <div className="text-lg font-semibold text-primary mt-1">
                      {formatPrice(item.price)}
                    </div>
                  </div>

                  {/* Quantité */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                      className="w-16 text-center"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Total article */}
                  <div className="text-right min-w-0">
                    <div className="font-semibold">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 p-1 h-auto"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Résumé de la commande */}
      <div className="lg:col-span-1">
        <Card className="p-6 sticky top-24">
          <h2 className="text-xl font-semibold mb-6">Résumé de la commande</h2>
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between">
              <span>Sous-total</span>
              <span className="font-medium">{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Livraison</span>
              <span>Gratuite</span>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span className="text-primary">{formatPrice(totalPrice)}</span>
              </div>
            </div>
          </div>

          <Link href="/commande" className="block">
            <Button size="lg" className="w-full">
              Passer la commande
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>

          <div className="mt-4 pt-4 border-t">
            <Link href="/catalogue" className="block">
              <Button variant="outline" className="w-full">
                Continuer les achats
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

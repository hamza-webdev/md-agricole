
'use client';

import { useCart } from '@/hooks/use-cart';
import { CartClient } from '@/components/cart/cart-client';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice } = useCart();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Panier d'achat
        </h1>
        <p className="text-muted-foreground">
          Vérifiez vos articles avant de procéder à la commande
        </p>
      </div>

      <CartClient
        items={items}
        updateQuantity={updateQuantity}
        removeItem={removeItem}
        clearCart={clearCart}
        totalPrice={getTotalPrice()}
      />
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Loader2, 
  Plus, 
  Minus, 
  ShoppingCart,
  Package,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
}

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  stockQuantity: number;
  category: {
    name: string;
  };
}

interface OrderItem {
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
}

interface CreateOrderDialogProps {
  user: User;
  onClose: () => void;
  onOrderCreated: () => void;
}

export function CreateOrderDialog({ user, onClose, onOrderCreated }: CreateOrderDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [notes, setNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Charger les produits disponibles
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/admin/products');
        if (response.ok) {
          const productsData = await response.json();
          setProducts(productsData.filter((p: Product) => p.stockQuantity > 0));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des produits:', error);
        toast.error('Erreur lors du chargement des produits');
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  // Filtrer les produits selon la recherche
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Ajouter un produit à la commande
  const addProductToOrder = (product: Product) => {
    const existingItem = orderItems.find(item => item.productId === product.id);
    
    if (existingItem) {
      if (existingItem.quantity < product.stockQuantity) {
        setOrderItems(prev => prev.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      } else {
        toast.error('Stock insuffisant');
      }
    } else {
      setOrderItems(prev => [...prev, {
        productId: product.id,
        product,
        quantity: 1,
        unitPrice: product.price
      }]);
    }
  };

  // Modifier la quantité d'un produit
  const updateQuantity = (productId: string, newQuantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (newQuantity <= 0) {
      removeFromOrder(productId);
      return;
    }

    if (newQuantity > product.stockQuantity) {
      toast.error('Stock insuffisant');
      return;
    }

    setOrderItems(prev => prev.map(item =>
      item.productId === productId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  // Supprimer un produit de la commande
  const removeFromOrder = (productId: string) => {
    setOrderItems(prev => prev.filter(item => item.productId !== productId));
  };

  // Calculer le total
  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + (item.quantity * item.unitPrice), 0);
  };

  // Créer la commande
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (orderItems.length === 0) {
      toast.error('Veuillez ajouter au moins un produit à la commande');
      return;
    }

    setIsLoading(true);

    try {
      const orderData = {
        userId: user.id,
        customerName: `${user.firstName} ${user.lastName}`,
        customerEmail: user.email,
        customerPhone: user.phone || '',
        deliveryAddress: user.address || '',
        deliveryCity: user.city || '',
        deliveryPostalCode: user.postalCode || '',
        notes: notes.trim() || undefined,
        orderItems: orderItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        })),
        totalAmount: calculateTotal()
      };

      const response = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la création de la commande');
      }

      toast.success('Commande créée avec succès !');

      // Proposer de créer une facture
      if (confirm('Commande créée ! Voulez-vous créer une facture pour cette commande ?')) {
        try {
          const invoiceResponse = await fetch('/api/admin/invoices', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              orderId: result.order.id,
              dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 jours
            }),
          });

          if (invoiceResponse.ok) {
            toast.success('Facture créée automatiquement !');
          }
        } catch (error) {
          console.error('Erreur lors de la création de la facture:', error);
        }
      }

      onClose();
      onOrderCreated();

    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la création de la commande');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
    }).format(amount);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <ShoppingCart className="h-5 w-5" />
            <span>Créer une commande</span>
          </DialogTitle>
          <DialogDescription>
            Créer une nouvelle commande pour {user.firstName} {user.lastName} ({user.email})
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Recherche de produits */}
          <div className="space-y-4">
            <Label>Ajouter des produits</Label>
            <Input
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            {loadingProducts ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Chargement des produits...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto border rounded-lg p-4">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                      {product.images[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-full h-full p-2 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.category.name}</p>
                      <p className="text-sm font-medium text-green-600">
                        {formatCurrency(product.price)}
                      </p>
                      <p className="text-xs text-gray-500">Stock: {product.stockQuantity}</p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => addProductToOrder(product)}
                      disabled={orderItems.some(item => item.productId === product.id && item.quantity >= product.stockQuantity)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Produits sélectionnés */}
          {orderItems.length > 0 && (
            <div className="space-y-4">
              <Label>Produits sélectionnés</Label>
              <div className="border rounded-lg p-4 space-y-3">
                {orderItems.map((item) => (
                  <div key={item.productId} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                      {item.product.images[0] ? (
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-full h-full p-2 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatCurrency(item.unitPrice)} × {item.quantity} = {formatCurrency(item.quantity * item.unitPrice)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stockQuantity}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => removeFromOrder(item.productId)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-green-600">{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes sur la commande..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || orderItems.length === 0}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                'Créer la commande'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

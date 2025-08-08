'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Loader2, 
  ShoppingCart,
  Package,
  Calendar,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  orderItems: Array<{
    id: string;
    quantity: number;
    unitPrice: number;
    product: {
      name: string;
      images: string[];
    };
  }>;
}

interface UserOrdersDialogProps {
  user: User;
  onClose: () => void;
}

export function UserOrdersDialog({ user, onClose }: UserOrdersDialogProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchUserOrders = async () => {
      try {
        const response = await fetch(`/api/admin/users/${user.id}/orders`);
        if (response.ok) {
          const ordersData = await response.json();
          setOrders(ordersData);
        } else {
          throw new Error('Erreur lors du chargement des commandes');
        }
      } catch (error) {
        console.error('Erreur:', error);
        toast.error('Erreur lors du chargement des commandes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserOrders();
  }, [user.id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'PROCESSING':
        return 'bg-purple-100 text-purple-800';
      case 'SHIPPED':
        return 'bg-orange-100 text-orange-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'En attente';
      case 'CONFIRMED':
        return 'Confirmée';
      case 'PROCESSING':
        return 'En traitement';
      case 'SHIPPED':
        return 'Expédiée';
      case 'DELIVERED':
        return 'Livrée';
      case 'CANCELLED':
        return 'Annulée';
      default:
        return status;
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <ShoppingCart className="h-5 w-5" />
            <span>Commandes de {user.firstName} {user.lastName}</span>
          </DialogTitle>
          <DialogDescription>
            Historique des commandes pour {user.email}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Chargement des commandes...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Aucune commande trouvée</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4 space-y-3">
                  {/* En-tête de commande */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium">{order.orderNumber}</p>
                        <p className="text-sm text-gray-500 flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusLabel(order.status)}
                      </Badge>
                      <p className="text-lg font-bold text-green-600 mt-1">
                        {formatCurrency(order.totalAmount)}
                      </p>
                    </div>
                  </div>

                  {/* Articles de la commande */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Articles:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {order.orderItems.map((item) => (
                        <div key={item.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                          <Package className="h-4 w-4 text-gray-400" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{item.product.name}</p>
                            <p className="text-xs text-gray-500">
                              {item.quantity} × {formatCurrency(item.unitPrice)} = {formatCurrency(item.quantity * item.unitPrice)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

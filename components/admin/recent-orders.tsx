'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Clock, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

interface RecentOrdersProps {
  orders: Array<{
    id: string;
    totalAmount: number;
    status: string;
    createdAt: Date;
    user: {
      name: string | null;
      email: string;
    };
  }>;
}

const statusConfig = {
  PENDING: {
    label: 'En attente',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
  },
  CONFIRMED: {
    label: 'Confirmée',
    color: 'bg-blue-100 text-blue-800',
    icon: CheckCircle,
  },
  SHIPPED: {
    label: 'Expédiée',
    color: 'bg-purple-100 text-purple-800',
    icon: CheckCircle,
  },
  DELIVERED: {
    label: 'Livrée',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
  },
  CANCELLED: {
    label: 'Annulée',
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
  },
};

export function RecentOrders({ orders }: RecentOrdersProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Commandes récentes</CardTitle>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/orders">
            Voir tout
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Aucune commande récente</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.PENDING;
              const StatusIcon = status.icon;

              return (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <StatusIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900">
                          Commande #{order.id.slice(-8)}
                        </p>
                        <Badge className={status.color}>
                          {status.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {order.user.name || order.user.email}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {order.totalAmount.toLocaleString()} TND
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/orders/${order.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

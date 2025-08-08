'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Package, Edit } from 'lucide-react';
import Link from 'next/link';

interface LowStockAlertProps {
  products: Array<{
    id: string;
    name: string;
    stockQuantity: number;
    category: {
      name: string;
    };
  }>;
}

export function LowStockAlert({ products }: LowStockAlertProps) {
  const getStockStatus = (quantity: number) => {
    if (quantity === 0) {
      return {
        label: 'Rupture',
        color: 'bg-red-100 text-red-800',
        textColor: 'text-red-600',
      };
    } else if (quantity <= 2) {
      return {
        label: 'Critique',
        color: 'bg-orange-100 text-orange-800',
        textColor: 'text-orange-600',
      };
    } else {
      return {
        label: 'Faible',
        color: 'bg-yellow-100 text-yellow-800',
        textColor: 'text-yellow-600',
      };
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold flex items-center">
          <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
          Alertes stock faible
        </CardTitle>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/products?filter=low-stock">
            Voir tout
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Aucun produit en stock faible</p>
            <p className="text-sm">Tous vos produits ont un stock suffisant</p>
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product) => {
              const stockStatus = getStockStatus(product.stockQuantity);

              return (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900">
                          {product.name}
                        </p>
                        <Badge className={stockStatus.color}>
                          {stockStatus.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        Catégorie: {product.category.name}
                      </p>
                      <p className={`text-sm font-medium ${stockStatus.textColor}`}>
                        Stock restant: {product.stockQuantity} unité{product.stockQuantity !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/products/${product.id}/edit`}>
                        <Edit className="h-4 w-4 mr-1" />
                        Modifier
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {products.length > 0 && (
          <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-orange-800">Action recommandée</h4>
                <p className="text-sm text-orange-700 mt-1">
                  Pensez à réapprovisionner ces produits pour éviter les ruptures de stock.
                  Vous pouvez modifier les quantités directement depuis la gestion des produits.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

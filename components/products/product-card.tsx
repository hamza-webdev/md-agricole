
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Eye } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  brand?: string;
  model?: string;
  slug: string;
  category: {
    name: string;
  };
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || '',
      brand: product.brand || '',
      model: product.model || ''
    });

    toast.success(`${product.name} ajouté au panier`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND'
    }).format(price);
  };

  return (
    <div className="group bg-card rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border">
      <Link href={`/produits/${product.slug}`} className="block">
        <div className="relative aspect-video bg-muted">
          {product.images?.[0] && (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          )}
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="bg-white/90">
              {product.category?.name}
            </Badge>
          </div>
        </div>
      </Link>

      <div className="p-6">
        <div className="mb-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
              <Link href={`/produits/${product.slug}`}>
                {product.name}
              </Link>
            </h3>
          </div>
          
          {(product.brand || product.model) && (
            <p className="text-sm text-muted-foreground mt-1">
              {product.brand} {product.model && `• ${product.model}`}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-lg font-bold text-primary">
            {formatPrice(product.price)}
          </div>
          
          <div className="flex items-center gap-2">
            <Link href={`/produits/${product.slug}`}>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
            <Button 
              size="sm" 
              onClick={handleAddToCart}
              className="bg-primary hover:bg-primary/90"
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

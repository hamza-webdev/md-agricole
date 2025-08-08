
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ShoppingCart, Share, ArrowLeft, Package, Award, Truck } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { toast } from 'sonner';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  images: string[];
  brand?: string;
  model?: string;
  power?: string;
  weight?: string;
  dimensions?: string;
  features: string[];
  specifications?: any;
  category: {
    name: string;
  };
}

interface ProductDetailsProps {
  product: Product;
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || '',
      brand: product.brand || '',
      model: product.model || '',
      quantity
    });

    toast.success(`${quantity}x ${product.name} ajouté au panier`);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Découvrez ${product.name} sur MD Agricole`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Erreur lors du partage');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Lien copié dans le presse-papier');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND'
    }).format(price);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link 
          href="/catalogue" 
          className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour au catalogue
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Images */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="space-y-4">
            <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
              {product.images?.[selectedImage] && (
                <Image
                  src={product.images[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              )}
            </div>
            
            {product.images?.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative aspect-square bg-muted rounded-md overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 25vw, 12vw"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Informations produit */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-6"
        >
          <div>
            <Badge variant="secondary" className="mb-3">
              {product.category?.name}
            </Badge>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {product.name}
            </h1>
            {(product.brand || product.model) && (
              <p className="text-lg text-muted-foreground">
                {product.brand} {product.model && `• ${product.model}`}
              </p>
            )}
          </div>

          <div className="text-3xl font-bold text-primary">
            {formatPrice(product.price)}
          </div>

          {product.description && (
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {/* Spécifications rapides */}
          {(product.power || product.weight || product.dimensions) && (
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Spécifications</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                {product.power && (
                  <div>
                    <span className="text-muted-foreground">Puissance</span>
                    <p className="font-medium">{product.power}</p>
                  </div>
                )}
                {product.weight && (
                  <div>
                    <span className="text-muted-foreground">Poids</span>
                    <p className="font-medium">{product.weight}</p>
                  </div>
                )}
                {product.dimensions && (
                  <div>
                    <span className="text-muted-foreground">Dimensions</span>
                    <p className="font-medium">{product.dimensions}</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Actions */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label htmlFor="quantity" className="text-sm font-medium">
                  Quantité:
                </label>
                <select
                  id="quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="border rounded px-3 py-1 w-20"
                >
                  {[1,2,3,4,5].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleAddToCart}
                className="flex-1 h-12"
                size="lg"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Ajouter au panier
              </Button>
              <Button 
                variant="outline" 
                onClick={handleShare}
                className="h-12"
                size="lg"
              >
                <Share className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Avantages */}
          <Card className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" />
                <span>Garantie constructeur</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary" />
                <span>Livraison gratuite</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                <span>En stock</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Caractéristiques détaillées */}
      {product.features?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6">Caractéristiques</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

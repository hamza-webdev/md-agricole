'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal,
  Edit,
  Trash2,
  Settings,
  ExternalLink,
  Eye,
  EyeOff
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Product } from '@/lib/types';

interface ProductActionsProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onToggleStatus: (productId: string, isActive: boolean) => void;
}

export function ProductActions({ product, onEdit, onDelete, onToggleStatus }: ProductActionsProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleStatus = async () => {
    setIsLoading(true);
    try {
      await onToggleStatus(product.id, product.isActive);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="hover:bg-gray-100 data-[state=open]:bg-gray-100"
          disabled={isLoading}
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Actions pour {product.name}</span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-48">
        {/* Voir le produit */}
        <DropdownMenuItem asChild>
          <Link href={`/produits/${product.slug}`} className="flex items-center">
            <ExternalLink className="h-4 w-4 mr-2" />
            Voir sur le site
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* Modifier */}
        <DropdownMenuItem onClick={() => onEdit(product)}>
          <Edit className="h-4 w-4 mr-2" />
          Modifier
        </DropdownMenuItem>
        
        {/* Activer/Désactiver */}
        <DropdownMenuItem onClick={handleToggleStatus} disabled={isLoading}>
          {product.isActive ? (
            <>
              <EyeOff className="h-4 w-4 mr-2" />
              Désactiver
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 mr-2" />
              Activer
            </>
          )}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* Supprimer */}
        <DropdownMenuItem 
          onClick={() => onDelete(product)}
          className="text-red-600 focus:text-red-600 focus:bg-red-50"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Supprimer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

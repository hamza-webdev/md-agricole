'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Product } from '@/lib/types';

interface DeleteProductDialogProps {
  product: Product;
  onClose: () => void;
  onProductDeleted: () => void;
}

export function DeleteProductDialog({ product, onClose, onProductDeleted }: DeleteProductDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Erreur lors de la suppression');
      }

      toast.success('Produit supprimé avec succès');
      onClose();
      onProductDeleted();

    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la suppression');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span>Confirmer la suppression</span>
          </DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer le produit <strong>"{product.name}"</strong> ?
            <br />
            <br />
            Cette action est irréversible et supprimera définitivement :
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Toutes les informations du produit</li>
              <li>Les images associées</li>
              <li>L'historique du produit</li>
            </ul>
          </DialogDescription>
        </DialogHeader>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-800">Attention</h4>
              <p className="text-sm text-red-700 mt-1">
                Si ce produit est présent dans des commandes, la suppression sera bloquée. 
                Vous pouvez le désactiver à la place.
              </p>
            </div>
          </div>
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
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Suppression...
              </>
            ) : (
              'Supprimer définitivement'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

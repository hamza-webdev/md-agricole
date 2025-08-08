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
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
}

interface EditCategoryDialogProps {
  category: Category;
  onClose: () => void;
  onCategoryUpdated: () => void;
}

interface CategoryFormData {
  name: string;
  description: string;
  isActive: boolean;
}

export function EditCategoryDialog({ category, onClose, onCategoryUpdated }: EditCategoryDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: category.name,
    description: category.description || '',
    isActive: category.isActive,
  });

  const handleInputChange = (field: keyof CategoryFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validation basique
      if (!formData.name.trim()) {
        toast.error('Le nom de la catégorie est obligatoire');
        return;
      }

      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          isActive: formData.isActive,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la modification de la catégorie');
      }

      toast.success('Catégorie modifiée avec succès !');
      onClose();
      onCategoryUpdated();

    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la modification de la catégorie');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier la catégorie</DialogTitle>
          <DialogDescription>
            Modifiez les informations de la catégorie "{category.name}"
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nom de la catégorie */}
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nom de la catégorie *</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Ex: Tracteurs, Outils agricoles..."
              required
            />
          </div>

          {/* Slug (lecture seule) */}
          <div className="space-y-2">
            <Label htmlFor="edit-slug">Slug (URL)</Label>
            <Input
              id="edit-slug"
              value={category.slug}
              disabled
              className="bg-gray-100"
            />
            <p className="text-xs text-gray-500">
              Le slug est généré automatiquement et ne peut pas être modifié
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Description de la catégorie (optionnel)"
              rows={3}
            />
          </div>

          {/* Statut actif */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="edit-isActive"
              checked={formData.isActive}
              onChange={(e) => handleInputChange('isActive', e.target.checked)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="edit-isActive" className="text-sm">
              Catégorie active
            </Label>
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Modification...
                </>
              ) : (
                'Modifier la catégorie'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

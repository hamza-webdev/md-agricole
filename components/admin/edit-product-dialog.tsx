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
import { Loader2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { Product } from '@/lib/types';

interface EditProductDialogProps {
  product: Product;
  categories: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  onClose: () => void;
  onProductUpdated: () => void;
}

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  brand: string;
  model: string;
  power: string;
  stockQuantity: number;
  categoryId: string;
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
}

export function EditProductDialog({ product, categories, onClose, onProductUpdated }: EditProductDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    name: product.name,
    description: product.description || '',
    price: product.price,
    brand: product.brand || '',
    model: product.model || '',
    power: product.power || '',
    stockQuantity: product.stockQuantity,
    categoryId: product.categoryId,
    images: product.images || [],
    isActive: product.isActive,
    isFeatured: product.isFeatured,
  });

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de l\'upload');
      }

      // Ajouter l'URL de l'image à la liste
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, result.url]
      }));

      toast.success('Image uploadée avec succès !');
    } catch (error) {
      console.error('Erreur upload:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'upload');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validation basique
      if (!formData.name || !formData.description || !formData.categoryId) {
        toast.error('Veuillez remplir tous les champs obligatoires');
        return;
      }

      if (formData.price <= 0) {
        toast.error('Le prix doit être supérieur à 0');
        return;
      }

      if (formData.stockQuantity < 0) {
        toast.error('La quantité en stock ne peut pas être négative');
        return;
      }

      // Préparer les données pour l'API
      const productData = {
        ...formData,
        features: formData.power ? [formData.power] : [],
        images: formData.images.filter(img => img.trim() !== ''),
        brand: formData.brand.trim() || undefined,
        model: formData.model.trim() || undefined,
        power: formData.power.trim() || undefined,
      };

      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la modification du produit');
      }

      toast.success('Produit modifié avec succès !');
      onClose();
      onProductUpdated();

    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la modification du produit');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier le produit</DialogTitle>
          <DialogDescription>
            Modifiez les informations du produit "{product.name}"
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Informations de base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nom du produit *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ex: Tracteur John Deere 5082E"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-categoryId">Catégorie *</Label>
              <select
                id="edit-categoryId"
                value={formData.categoryId}
                onChange={(e) => handleInputChange('categoryId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description *</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Description détaillée du produit..."
              rows={3}
              required
            />
          </div>

          {/* Détails techniques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-brand">Marque</Label>
              <Input
                id="edit-brand"
                value={formData.brand}
                onChange={(e) => handleInputChange('brand', e.target.value)}
                placeholder="Ex: John Deere"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-model">Modèle</Label>
              <Input
                id="edit-model"
                value={formData.model}
                onChange={(e) => handleInputChange('model', e.target.value)}
                placeholder="Ex: 5082E"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-power">Puissance</Label>
              <Input
                id="edit-power"
                value={formData.power}
                onChange={(e) => handleInputChange('power', e.target.value)}
                placeholder="Ex: 82 CV"
              />
            </div>
          </div>

          {/* Prix et stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-price">Prix (TND) *</Label>
              <Input
                id="edit-price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-stockQuantity">Quantité en stock *</Label>
              <Input
                id="edit-stockQuantity"
                type="number"
                min="0"
                value={formData.stockQuantity}
                onChange={(e) => handleInputChange('stockQuantity', parseInt(e.target.value) || 0)}
                placeholder="0"
                required
              />
            </div>
          </div>

          {/* Upload d'images */}
          <div className="space-y-2">
            <Label>Images du produit</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <div className="text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="edit-image-upload"
                  disabled={uploadingImage}
                />
                <label
                  htmlFor="edit-image-upload"
                  className="cursor-pointer inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  {uploadingImage ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Upload en cours...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      <span>Ajouter une image</span>
                    </>
                  )}
                </label>
              </div>

              {/* Aperçu des images */}
              {formData.images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {formData.images.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={imageUrl}
                          alt={`Produit ${index + 1}`}
                          width={150}
                          height={150}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Options */}
          <div className="flex items-center space-x-6">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm">Produit actif</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm">Produit vedette</span>
            </label>
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
                'Modifier le produit'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

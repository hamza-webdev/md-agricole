'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

interface User {
  id: string;
  email: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  idCardNumber: string | null;
  role: string;
  isActive: boolean;
}

interface EditUserDialogProps {
  user: User;
  onClose: () => void;
  onUserUpdated: () => void;
}

interface UserFormData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  idCardNumber: string;
  isActive: boolean;
}

export function EditUserDialog({ user, onClose, onUserUpdated }: EditUserDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    email: user.email,
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    phone: user.phone || '',
    address: user.address || '',
    city: user.city || '',
    postalCode: user.postalCode || '',
    idCardNumber: user.idCardNumber || '',
    isActive: user.isActive,
  });

  const handleInputChange = (field: keyof UserFormData, value: any) => {
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
      if (!formData.email.trim() || !formData.firstName.trim() || !formData.lastName.trim()) {
        toast.error('L\'email, le prénom et le nom sont obligatoires');
        return;
      }

      // Validation email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error('Veuillez saisir un email valide');
        return;
      }

      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          phone: formData.phone.trim() || null,
          address: formData.address.trim() || null,
          city: formData.city.trim() || null,
          postalCode: formData.postalCode.trim() || null,
          idCardNumber: formData.idCardNumber.trim() || null,
          isActive: formData.isActive,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la modification de l\'utilisateur');
      }

      toast.success('Utilisateur modifié avec succès !');
      onClose();
      onUserUpdated();

    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la modification de l\'utilisateur');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier l'utilisateur</DialogTitle>
          <DialogDescription>
            Modifiez les informations de l'utilisateur "{user.firstName} {user.lastName}"
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Informations personnelles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-firstName">Prénom *</Label>
              <Input
                id="edit-firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="Ex: Ahmed"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-lastName">Nom *</Label>
              <Input
                id="edit-lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Ex: Ben Ali"
                required
              />
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="ahmed.benali@email.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Téléphone</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Ex: +216 20 123 456"
              />
            </div>
          </div>

          {/* Adresse */}
          <div className="space-y-2">
            <Label htmlFor="edit-address">Adresse</Label>
            <Input
              id="edit-address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Ex: 123 Rue de la République"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-city">Ville</Label>
              <Input
                id="edit-city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="Ex: Tunis"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-postalCode">Code postal</Label>
              <Input
                id="edit-postalCode"
                value={formData.postalCode}
                onChange={(e) => handleInputChange('postalCode', e.target.value)}
                placeholder="Ex: 1000"
              />
            </div>
          </div>

          {/* Numéro CIN */}
          <div className="space-y-2">
            <Label htmlFor="edit-idCardNumber">Numéro de carte d'identité</Label>
            <Input
              id="edit-idCardNumber"
              value={formData.idCardNumber}
              onChange={(e) => handleInputChange('idCardNumber', e.target.value)}
              placeholder="Ex: 12345678"
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
              Compte actif
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
                'Modifier l\'utilisateur'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

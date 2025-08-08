
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ShoppingCart } from 'lucide-react';

interface OrderFormProps {
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
  user: any;
}

export function OrderForm({ onSubmit, isSubmitting, user }: OrderFormProps) {
  const [formData, setFormData] = useState({
    customerName: user?.name || '',
    customerEmail: user?.email || '',
    customerPhone: user?.phone || '',
    deliveryAddress: user?.address || '',
    deliveryCity: user?.city || '',
    deliveryPostalCode: user?.postalCode || '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-6">Informations de livraison</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="customerName">Nom complet *</Label>
            <Input
              id="customerName"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="customerPhone">Téléphone *</Label>
            <Input
              id="customerPhone"
              name="customerPhone"
              type="tel"
              value={formData.customerPhone}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="customerEmail">Email *</Label>
          <Input
            id="customerEmail"
            name="customerEmail"
            type="email"
            value={formData.customerEmail}
            onChange={handleChange}
            required
            disabled={isSubmitting}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="deliveryAddress">Adresse de livraison *</Label>
          <Input
            id="deliveryAddress"
            name="deliveryAddress"
            value={formData.deliveryAddress}
            onChange={handleChange}
            required
            disabled={isSubmitting}
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="deliveryCity">Ville *</Label>
            <Input
              id="deliveryCity"
              name="deliveryCity"
              value={formData.deliveryCity}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="deliveryPostalCode">Code postal</Label>
            <Input
              id="deliveryPostalCode"
              name="deliveryPostalCode"
              value={formData.deliveryPostalCode}
              onChange={handleChange}
              disabled={isSubmitting}
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="notes">Notes (optionnel)</Label>
          <Textarea
            id="notes"
            name="notes"
            placeholder="Instructions spéciales pour la livraison..."
            value={formData.notes}
            onChange={handleChange}
            disabled={isSubmitting}
            className="mt-1"
            rows={3}
          />
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full mt-8"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            'Traitement en cours...'
          ) : (
            <>
              <ShoppingCart className="h-5 w-5 mr-2" />
              Confirmer la commande
            </>
          )}
        </Button>
      </form>
    </Card>
  );
}

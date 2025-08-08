'use client';

import { useState } from 'react';
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
import { CreditCard, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Invoice {
  id: string;
  invoiceNumber: string;
  totalAmount: number;
  remainingAmount: number;
  user: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
}

interface AddPaymentDialogProps {
  invoice: Invoice;
  onClose: () => void;
  onPaymentAdded: () => void;
}

interface PaymentFormData {
  amount: number;
  paymentMethod: string;
  notes: string;
  checkNumber: string;
  cardLast4: string;
  transactionId: string;
}

export function AddPaymentDialog({ invoice, onClose, onPaymentAdded }: AddPaymentDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<PaymentFormData>({
    amount: invoice.remainingAmount,
    paymentMethod: 'CASH',
    notes: '',
    checkNumber: '',
    cardLast4: '',
    transactionId: '',
  });

  const handleInputChange = (field: keyof PaymentFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.amount <= 0) {
      toast.error('Le montant doit être supérieur à 0');
      return;
    }

    if (formData.amount > invoice.remainingAmount) {
      toast.error('Le montant ne peut pas dépasser le montant restant');
      return;
    }

    setIsLoading(true);

    try {
      const paymentData = {
        invoiceId: invoice.id,
        amount: formData.amount,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes.trim() || undefined,
        checkNumber: formData.paymentMethod === 'CHECK' ? formData.checkNumber.trim() || undefined : undefined,
        cardLast4: formData.paymentMethod === 'CARD' ? formData.cardLast4.trim() || undefined : undefined,
        transactionId: ['CARD', 'BANK_TRANSFER'].includes(formData.paymentMethod) ? formData.transactionId.trim() || undefined : undefined,
      };

      const response = await fetch('/api/admin/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de l\'ajout du paiement');
      }

      toast.success('Paiement ajouté avec succès !');
      onClose();
      onPaymentAdded();

    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'ajout du paiement');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
    }).format(amount);
  };

  const getFullName = () => {
    if (invoice.user.firstName && invoice.user.lastName) {
      return `${invoice.user.firstName} ${invoice.user.lastName}`;
    }
    return invoice.user.email;
  };

  const paymentMethods = [
    { value: 'CASH', label: 'Espèces' },
    { value: 'CHECK', label: 'Chèque' },
    { value: 'CARD', label: 'Carte bancaire' },
    { value: 'CREDIT', label: 'À crédit' },
    { value: 'BANK_TRANSFER', label: 'Virement bancaire' },
  ];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Ajouter un paiement</span>
          </DialogTitle>
          <DialogDescription>
            Enregistrer un paiement pour la facture {invoice.invoiceNumber} de {getFullName()}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Informations facture */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span>Facture:</span>
              <span className="font-medium">{invoice.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Montant total:</span>
              <span className="font-medium">{formatCurrency(invoice.totalAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Reste à payer:</span>
              <span className="font-bold text-red-600">{formatCurrency(invoice.remainingAmount)}</span>
            </div>
          </div>

          {/* Montant du paiement */}
          <div className="space-y-2">
            <Label htmlFor="amount">Montant du paiement (TND) *</Label>
            <Input
              id="amount"
              type="number"
              min="0.01"
              max={invoice.remainingAmount}
              step="0.01"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              required
            />
          </div>

          {/* Méthode de paiement */}
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Méthode de paiement *</Label>
            <select
              id="paymentMethod"
              value={formData.paymentMethod}
              onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            >
              {paymentMethods.map((method) => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </div>

          {/* Champs spécifiques selon la méthode */}
          {formData.paymentMethod === 'CHECK' && (
            <div className="space-y-2">
              <Label htmlFor="checkNumber">Numéro de chèque</Label>
              <Input
                id="checkNumber"
                value={formData.checkNumber}
                onChange={(e) => handleInputChange('checkNumber', e.target.value)}
                placeholder="Ex: 1234567"
              />
            </div>
          )}

          {formData.paymentMethod === 'CARD' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cardLast4">4 derniers chiffres de la carte</Label>
                <Input
                  id="cardLast4"
                  value={formData.cardLast4}
                  onChange={(e) => handleInputChange('cardLast4', e.target.value)}
                  placeholder="1234"
                  maxLength={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="transactionId">ID de transaction</Label>
                <Input
                  id="transactionId"
                  value={formData.transactionId}
                  onChange={(e) => handleInputChange('transactionId', e.target.value)}
                  placeholder="TXN123456"
                />
              </div>
            </div>
          )}

          {formData.paymentMethod === 'BANK_TRANSFER' && (
            <div className="space-y-2">
              <Label htmlFor="transactionId">Référence du virement</Label>
              <Input
                id="transactionId"
                value={formData.transactionId}
                onChange={(e) => handleInputChange('transactionId', e.target.value)}
                placeholder="REF123456"
              />
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Notes sur le paiement..."
              rows={3}
            />
          </div>

          {/* Récapitulatif */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Montant à enregistrer:</span>
              <span className="font-bold text-green-600">{formatCurrency(formData.amount)}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-600">Reste après ce paiement:</span>
              <span className="text-sm font-medium">
                {formatCurrency(invoice.remainingAmount - formData.amount)}
              </span>
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                'Enregistrer le paiement'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

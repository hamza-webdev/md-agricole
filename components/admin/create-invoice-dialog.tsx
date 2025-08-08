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
  DialogTrigger,
} from '@/components/ui/dialog';
import { FileText, Loader2, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface CreateInvoiceDialogProps {
  onInvoiceCreated: () => void;
}

interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  customerName: string;
  customerEmail: string;
  createdAt: string;
  user: {
    firstName: string | null;
    lastName: string | null;
  };
  invoice?: {
    id: string;
    invoiceNumber: string;
  };
}

export function CreateInvoiceDialog({ onInvoiceCreated }: CreateInvoiceDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [taxAmount, setTaxAmount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState('');

  // Charger les commandes sans facture
  useEffect(() => {
    if (open) {
      fetchOrdersWithoutInvoice();
    }
  }, [open]);

  const fetchOrdersWithoutInvoice = async () => {
    setLoadingOrders(true);
    try {
      console.log('🔍 Chargement des commandes sans facture...');
      const response = await fetch('/api/admin/orders?withoutInvoice=true');
      console.log('📡 Réponse API:', response.status, response.statusText);

      if (response.ok) {
        const ordersData = await response.json();
        console.log('📦 Commandes reçues:', ordersData.length, ordersData);
        setOrders(ordersData);
      } else {
        console.error('❌ Erreur API:', response.status, response.statusText);
        toast.error('Erreur lors du chargement des commandes');
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des commandes:', error);
      toast.error('Erreur lors du chargement des commandes');
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedOrderId) {
      toast.error('Veuillez sélectionner une commande');
      return;
    }

    setIsLoading(true);

    try {
      const selectedOrder = orders.find(o => o.id === selectedOrderId);
      if (!selectedOrder) {
        throw new Error('Commande non trouvée');
      }

      const invoiceData = {
        orderId: selectedOrderId,
        taxAmount: taxAmount || 0,
        discountAmount: discountAmount || 0,
        notes: notes.trim() || undefined,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      };

      const response = await fetch('/api/admin/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la création de la facture');
      }

      toast.success('Facture créée avec succès !');
      setOpen(false);
      resetForm();
      onInvoiceCreated();

    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la création de la facture');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedOrderId('');
    setTaxAmount(0);
    setDiscountAmount(0);
    setNotes('');
    setDueDate('');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  const calculateTotal = () => {
    const selectedOrder = orders.find(o => o.id === selectedOrderId);
    if (!selectedOrder) return 0;
    
    return selectedOrder.totalAmount + taxAmount - discountAmount;
  };

  // Date par défaut : 30 jours à partir d'aujourd'hui
  const getDefaultDueDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center space-x-2">
          <FileText className="h-4 w-4" />
          <span>Créer une facture</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer une nouvelle facture</DialogTitle>
          <DialogDescription>
            Créez une facture à partir d'une commande confirmée
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Sélection de commande */}
          <div className="space-y-2">
            <Label htmlFor="orderId">Commande *</Label>
            {loadingOrders ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span>Chargement des commandes...</span>
              </div>
            ) : (
              <>
                <select
                  id="orderId"
                  value={selectedOrderId}
                  onChange={(e) => setSelectedOrderId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                >
                  <option value="">Sélectionner une commande</option>
                  {orders.map((order) => {
                    const customerName = order.customerName ||
                      (order.user.firstName && order.user.lastName
                        ? `${order.user.firstName} ${order.user.lastName}`
                        : order.customerEmail);

                    return (
                      <option key={order.id} value={order.id}>
                        {order.orderNumber} - {customerName} - {formatCurrency(order.totalAmount)} ({formatDate(order.createdAt)})
                      </option>
                    );
                  })}
                </select>

                {/* Debug info */}
                <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                  <p><strong>Debug:</strong> {orders.length} commande(s) chargée(s)</p>
                  {orders.length > 0 && (
                    <ul className="mt-1">
                      {orders.map(order => (
                        <li key={order.id}>
                          {order.orderNumber} - {order.customerName} - {formatCurrency(order.totalAmount)}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}
            {orders.length === 0 && !loadingOrders && (
              <div className="text-sm text-gray-500 space-y-2">
                <p>Aucune commande sans facture trouvée</p>
                <button
                  type="button"
                  onClick={fetchOrdersWithoutInvoice}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Recharger les commandes
                </button>
              </div>
            )}
          </div>

          {/* Détails financiers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="taxAmount">TVA (TND)</Label>
              <Input
                id="taxAmount"
                type="number"
                min="0"
                step="0.01"
                value={taxAmount}
                onChange={(e) => setTaxAmount(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="discountAmount">Remise (TND)</Label>
              <Input
                id="discountAmount"
                type="number"
                min="0"
                step="0.01"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Date d'échéance */}
          <div className="space-y-2">
            <Label htmlFor="dueDate">Date d'échéance</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="dueDate"
                type="date"
                value={dueDate || getDefaultDueDate()}
                onChange={(e) => setDueDate(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes sur la facture..."
              rows={3}
            />
          </div>

          {/* Récapitulatif */}
          {selectedOrderId && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <h4 className="font-medium text-gray-900">Récapitulatif</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Montant commande:</span>
                  <span>{formatCurrency(orders.find(o => o.id === selectedOrderId)?.totalAmount || 0)}</span>
                </div>
                {taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span>TVA:</span>
                    <span>+{formatCurrency(taxAmount)}</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between">
                    <span>Remise:</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total facture:</span>
                  <span className="text-green-600">{formatCurrency(calculateTotal())}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading || !selectedOrderId}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                'Créer la facture'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

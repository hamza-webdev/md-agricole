'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  FileText,
  User,
  Package,
  Calendar,
  CreditCard,
  Printer
} from 'lucide-react';

interface Invoice {
  id: string;
  invoiceNumber: string;
  status: string;
  totalAmount: number;
  taxAmount: number;
  discountAmount: number;
  notes: string | null;
  dueDate: Date | null;
  createdAt: Date;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
  };
  order: {
    id: string;
    orderNumber: string;
    orderItems: Array<{
      id: string;
      quantity: number;
      unitPrice: number;
      product: {
        name: string;
        images: string[];
      };
    }>;
  };
  payments: Array<{
    id: string;
    amount: number;
    paymentMethod: string;
    status: string;
    createdAt: Date;
  }>;
  totalPaid: number;
  remainingAmount: number;
}

interface ViewInvoiceDialogProps {
  invoice: Invoice;
  onClose: () => void;
}

export function ViewInvoiceDialog({ invoice, onClose }: ViewInvoiceDialogProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(date));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'SENT':
        return 'bg-blue-100 text-blue-800';
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'En attente';
      case 'SENT':
        return 'Envoyée';
      case 'PAID':
        return 'Payée';
      case 'OVERDUE':
        return 'En retard';
      case 'CANCELLED':
        return 'Annulée';
      default:
        return status;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'CASH':
        return 'Espèces';
      case 'CHECK':
        return 'Chèque';
      case 'CARD':
        return 'Carte bancaire';
      case 'CREDIT':
        return 'À crédit';
      case 'BANK_TRANSFER':
        return 'Virement bancaire';
      default:
        return method;
    }
  };

  const getFullName = () => {
    if (invoice.user.firstName && invoice.user.lastName) {
      return `${invoice.user.firstName} ${invoice.user.lastName}`;
    }
    return invoice.user.email;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Facture {invoice.invoiceNumber}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(invoice.status)}>
                {getStatusLabel(invoice.status)}
              </Badge>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Imprimer
              </Button>
            </div>
          </DialogTitle>
          <DialogDescription>
            Détails de la facture pour la commande {invoice.order.orderNumber}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Informations client */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center">
                <User className="h-5 w-5 mr-2" />
                Informations client
              </h3>
              <div className="space-y-2">
                <p><strong>Nom:</strong> {getFullName()}</p>
                <p><strong>Email:</strong> {invoice.user.email}</p>
                {invoice.user.phone && (
                  <p><strong>Téléphone:</strong> {invoice.user.phone}</p>
                )}
                {invoice.user.address && (
                  <p><strong>Adresse:</strong> {invoice.user.address}</p>
                )}
                {invoice.user.city && (
                  <p><strong>Ville:</strong> {invoice.user.city}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Informations facture
              </h3>
              <div className="space-y-2">
                <p><strong>Numéro:</strong> {invoice.invoiceNumber}</p>
                <p><strong>Date d'émission:</strong> {formatDate(invoice.createdAt)}</p>
                {invoice.dueDate && (
                  <p><strong>Date d'échéance:</strong> {formatDate(invoice.dueDate)}</p>
                )}
                <p><strong>Commande:</strong> {invoice.order.orderNumber}</p>
              </div>
            </div>
          </div>

          {/* Articles */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Articles
            </h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium">Produit</th>
                    <th className="text-center py-3 px-4 font-medium">Quantité</th>
                    <th className="text-right py-3 px-4 font-medium">Prix unitaire</th>
                    <th className="text-right py-3 px-4 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.order.orderItems.map((item) => (
                    <tr key={item.id} className="border-t">
                      <td className="py-3 px-4">{item.product.name}</td>
                      <td className="py-3 px-4 text-center">{item.quantity}</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="py-3 px-4 text-right font-medium">
                        {formatCurrency(item.quantity * item.unitPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totaux */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Sous-total:</span>
                  <span>{formatCurrency(invoice.totalAmount - invoice.taxAmount + invoice.discountAmount)}</span>
                </div>
                {invoice.discountAmount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Remise:</span>
                    <span>-{formatCurrency(invoice.discountAmount)}</span>
                  </div>
                )}
                {invoice.taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span>TVA:</span>
                    <span>+{formatCurrency(invoice.taxAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span className="text-green-600">{formatCurrency(invoice.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Paiements */}
          {invoice.payments.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Paiements ({invoice.payments.length})
              </h3>
              <div className="space-y-2">
                {invoice.payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{formatCurrency(payment.amount)}</p>
                      <p className="text-sm text-gray-500">
                        {getPaymentMethodLabel(payment.paymentMethod)} - {formatDate(payment.createdAt)}
                      </p>
                    </div>
                    <Badge className={payment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {payment.status === 'COMPLETED' ? 'Terminé' : 'En attente'}
                    </Badge>
                  </div>
                ))}
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total payé:</span>
                  <span className="font-bold text-green-600">{formatCurrency(invoice.totalPaid)}</span>
                </div>
                {invoice.remainingAmount > 0 && (
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-medium">Reste à payer:</span>
                    <span className="font-bold text-red-600">{formatCurrency(invoice.remainingAmount)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {invoice.notes && (
            <div className="space-y-2">
              <h3 className="font-semibold">Notes</h3>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{invoice.notes}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

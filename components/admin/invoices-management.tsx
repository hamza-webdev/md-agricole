'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CreateInvoiceDialog } from './create-invoice-dialog';
import { ViewInvoiceDialog } from './view-invoice-dialog';
import { AddPaymentDialog } from './add-payment-dialog';
import { 
  Search, 
  FileText, 
  CreditCard,
  DollarSign,
  AlertTriangle,
  MoreHorizontal,
  Eye,
  Plus,
  Printer,
  Send
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

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
  paymentCount: number;
}

interface InvoicesManagementProps {
  invoices: Invoice[];
}

export function InvoicesManagement({ invoices: initialInvoices }: InvoicesManagementProps) {
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [invoices, setInvoices] = useState(initialInvoices);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [addingPaymentTo, setAddingPaymentTo] = useState<Invoice | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div>Chargement...</div>;
  }

  // Filtrer les factures
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${invoice.user.firstName} ${invoice.user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Fonction pour rafraîchir la liste des factures
  const handleInvoiceUpdated = async () => {
    try {
      const response = await fetch('/api/admin/invoices');
      if (response.ok) {
        const newInvoices = await response.json();
        setInvoices(newInvoices);
        toast.success('Liste des factures mise à jour');
      }
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
      toast.error('Erreur lors du rafraîchissement de la liste');
    }
  };

  // Fonction pour marquer une facture comme envoyée
  const handleMarkAsSent = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/admin/invoices/${invoiceId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'SENT' }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Erreur lors de la mise à jour');
      }

      setInvoices(prev => prev.map(invoice => 
        invoice.id === invoiceId ? { ...invoice, status: 'SENT' } : invoice
      ));
      
      toast.success('Facture marquée comme envoyée');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la mise à jour');
    }
  };

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

  const getFullName = (user: Invoice['user']) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.email;
  };

  return (
    <div className="space-y-6">
      {/* Header avec filtres */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher une facture..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          
          {/* Filtre par statut */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">Tous les statuts</option>
            <option value="PENDING">En attente</option>
            <option value="SENT">Envoyées</option>
            <option value="PAID">Payées</option>
            <option value="OVERDUE">En retard</option>
            <option value="CANCELLED">Annulées</option>
          </select>
        </div>

        {/* Boutons d'action */}
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={handleInvoiceUpdated}
            className="flex items-center space-x-2"
          >
            <FileText className="h-4 w-4" />
            <span>Actualiser</span>
          </Button>
          
          <CreateInvoiceDialog onInvoiceCreated={handleInvoiceUpdated} />
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total factures</p>
                <p className="text-2xl font-bold">{invoices.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Payées</p>
                <p className="text-2xl font-bold">
                  {invoices.filter(i => i.status === 'PAID').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">En retard</p>
                <p className="text-2xl font-bold">
                  {invoices.filter(i => i.status === 'OVERDUE').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">CA total</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(invoices.reduce((sum, i) => sum + i.totalAmount, 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des factures */}
      <Card>
        <CardHeader>
          <CardTitle>
            Factures ({filteredInvoices.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Aucune facture trouvée</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Facture</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Client</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Montant</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Payé</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Statut</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{invoice.invoiceNumber}</p>
                            <p className="text-sm text-gray-500">Commande: {invoice.order.orderNumber}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{getFullName(invoice.user)}</p>
                          <p className="text-sm text-gray-500">{invoice.user.email}</p>
                          {invoice.user.phone && (
                            <p className="text-sm text-gray-500">{invoice.user.phone}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-medium text-gray-900">
                          {formatCurrency(invoice.totalAmount)}
                        </p>
                        {invoice.taxAmount > 0 && (
                          <p className="text-sm text-gray-500">
                            TVA: {formatCurrency(invoice.taxAmount)}
                          </p>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-green-600">
                            {formatCurrency(invoice.totalPaid)}
                          </p>
                          {invoice.remainingAmount > 0 && (
                            <p className="text-sm text-red-500">
                              Reste: {formatCurrency(invoice.remainingAmount)}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={getStatusColor(invoice.status)}>
                          {getStatusLabel(invoice.status)}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-600">
                          {formatDate(invoice.createdAt)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end">
                          <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="force-pointer-events"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => setViewingInvoice(invoice)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Voir la facture
                              </DropdownMenuItem>
                              {invoice.remainingAmount > 0 && (
                                <DropdownMenuItem onClick={() => setAddingPaymentTo(invoice)}>
                                  <Plus className="h-4 w-4 mr-2" />
                                  Ajouter un paiement
                                </DropdownMenuItem>
                              )}
                              {invoice.status === 'PENDING' && (
                                <DropdownMenuItem onClick={() => handleMarkAsSent(invoice.id)}>
                                  <Send className="h-4 w-4 mr-2" />
                                  Marquer comme envoyée
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem>
                                <Printer className="h-4 w-4 mr-2" />
                                Imprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      {viewingInvoice && (
        <ViewInvoiceDialog
          invoice={viewingInvoice}
          onClose={() => setViewingInvoice(null)}
        />
      )}

      {addingPaymentTo && (
        <AddPaymentDialog
          invoice={addingPaymentTo}
          onClose={() => setAddingPaymentTo(null)}
          onPaymentAdded={handleInvoiceUpdated}
        />
      )}
    </div>
  );
}

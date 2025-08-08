'use client';

import { useState } from 'react';
import { AdminSidebar } from './admin-sidebar';
import { AdminHeader } from './admin-header';
import { InvoicesManagement } from './invoices-management';

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
  updatedAt: Date;
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

interface AdminInvoicesClientProps {
  user: any;
  invoices: Invoice[];
}

export function AdminInvoicesClient({ user, invoices }: AdminInvoicesClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <AdminSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <AdminHeader 
          user={user}
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* Invoices Management */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Gestion des factures
              </h1>
              <p className="text-gray-600">
                Gérez les factures et les paiements de vos clients
              </p>
            </div>

            <InvoicesManagement invoices={invoices} />
          </div>
        </main>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { AdminSidebar } from './admin-sidebar';
import { AdminHeader } from './admin-header';
import { UsersManagement } from './users-management';

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
  createdAt: Date;
  updatedAt: Date;
  totalOrders: number;
  totalInvoices: number;
  totalSpent: number;
}

interface AdminUsersClientProps {
  user: any;
  users: User[];
}

export function AdminUsersClient({ user, users }: AdminUsersClientProps) {
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

        {/* Users Management */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Gestion des utilisateurs
              </h1>
              <p className="text-gray-600">
                Gérez les comptes clients et créez des commandes pour vos clients
              </p>
            </div>

            <UsersManagement users={users} />
          </div>
        </main>
      </div>
    </div>
  );
}

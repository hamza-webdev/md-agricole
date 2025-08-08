'use client';

import { useState } from 'react';
import { AdminSidebar } from './admin-sidebar';
import { AdminHeader } from './admin-header';
import { ProductsManagement } from './products-management';
import { Product } from '@/lib/types';

interface AdminProductsClientProps {
  user: any;
  products: Product[];
  categories: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

export function AdminProductsClient({ user, products, categories }: AdminProductsClientProps) {
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

        {/* Products Management */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Gestion des produits
              </h1>
              <p className="text-gray-600">
                Gérez votre catalogue de produits agricoles
              </p>
            </div>

            <ProductsManagement 
              products={products}
              categories={categories}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

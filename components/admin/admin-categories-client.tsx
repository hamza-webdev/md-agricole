'use client';

import { useState } from 'react';
import { AdminSidebar } from './admin-sidebar';
import { AdminHeader } from './admin-header';
import { CategoriesManagement } from './categories-management';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface AdminCategoriesClientProps {
  user: any;
  categories: Category[];
}

export function AdminCategoriesClient({ user, categories }: AdminCategoriesClientProps) {
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

        {/* Categories Management */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Gestion des catégories
              </h1>
              <p className="text-gray-600">
                Organisez votre catalogue en catégories de produits agricoles
              </p>
            </div>

            <CategoriesManagement categories={categories} />
          </div>
        </main>
      </div>
    </div>
  );
}

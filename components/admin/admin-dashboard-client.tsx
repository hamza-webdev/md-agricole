'use client';

import { useState } from 'react';
import { AdminSidebar } from './admin-sidebar';
import { AdminHeader } from './admin-header';
import { DashboardStats } from './dashboard-stats';
import { RecentOrders } from './recent-orders';
import { LowStockAlert } from './low-stock-alert';

interface AdminDashboardClientProps {
  user: any;
  stats: {
    totalUsers: number;
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    recentOrders: any[];
    lowStockProducts: any[];
  };
}

export function AdminDashboardClient({ user, stats }: AdminDashboardClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
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

          {/* Dashboard content */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
              {/* Welcome section */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Tableau de bord
                </h1>
                <p className="text-gray-600">
                  Bienvenue, {user.name}. Voici un aperçu de votre activité.
                </p>
              </div>

              {/* Stats cards */}
              <DashboardStats stats={stats} />

              {/* Content grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                {/* Recent orders */}
                <RecentOrders orders={stats.recentOrders} />

                {/* Low stock alert */}
                <LowStockAlert products={stats.lowStockProducts} />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

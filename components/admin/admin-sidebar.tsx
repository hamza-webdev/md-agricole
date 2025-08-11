'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { useI18n } from '@/components/i18n/I18nProvider';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  X,
  Tractor,
  FolderOpen,
  MessageSquare,
  FileText
} from 'lucide-react';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  // labels are kept as keys; rendered text uses ta()
  {
    name: 'admin.sidebar.dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    name: 'admin.sidebar.products',
    href: '/admin/products',
    icon: Package,
  },
  {
    name: 'admin.sidebar.categories',
    href: '/admin/categories',
    icon: FolderOpen,
  },
  {
    name: 'admin.sidebar.orders',
    href: '/admin/orders',
    icon: ShoppingCart,
  },
  {
    name: 'admin.sidebar.users',
    href: '/admin/users',
    icon: Users,
  },
  {
    name: 'admin.sidebar.invoices',
    href: '/admin/invoices',
    icon: FileText,
  },
  {
    name: 'admin.sidebar.messages',
    href: '/admin/messages',
    icon: MessageSquare,
  },
  {
    name: 'admin.sidebar.analytics',
    href: '/admin/analytics',
    icon: BarChart3,
  },
  {
    name: 'admin.sidebar.settings',
    href: '/admin/settings',
    icon: Settings,
  },
];

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { ta } = useI18n();


  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-agricultural-600 rounded-lg flex items-center justify-center">
              <Tractor className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">MD Agricole</h2>
              <p className="text-xs text-gray-500">Administration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200",
                    isActive
                      ? "bg-primary text-white shadow-sm"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  )}
                  onClick={() => onClose()}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5 flex-shrink-0",
                      isActive ? "text-white" : "text-gray-400 group-hover:text-gray-500"
                    )}
                  />
                  {ta(item.name)}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 text-sm text-gray-500">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium">Panel Admin</p>
              <p className="text-xs">Version 1.0.0</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

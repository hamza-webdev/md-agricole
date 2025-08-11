'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/components/i18n/I18nProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AddUserDialog } from './add-user-dialog';
import { EditUserDialog } from './edit-user-dialog';
import { CreateOrderDialog } from './create-order-dialog';
import { UserOrdersDialog } from './user-orders-dialog';
import {
  Search,
  Users,
  UserPlus,
  ShoppingCart,
  FileText,
  MoreHorizontal,
  Edit,
  Trash2,
  Plus,
  Eye,
  CreditCard
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

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

interface UsersManagementProps {
  users: User[];
}

export function UsersManagement({ users: initialUsers }: UsersManagementProps) {
  const { tau } = useI18n();
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState(initialUsers);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [creatingOrderFor, setCreatingOrderFor] = useState<User | null>(null);
  const [viewingOrdersFor, setViewingOrdersFor] = useState<User | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div>Chargement...</div>;
  }

  // Filtrer les utilisateurs
  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.includes(searchTerm)
  );

  // Fonction pour rafraîchir la liste des utilisateurs
  const handleUserAdded = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const newUsers = await response.json();
        setUsers(newUsers);
        toast.success('Liste des utilisateurs mise à jour');
      }
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
      toast.error('Erreur lors du rafraîchissement de la liste');
    }
  };

  // Fonction pour supprimer un utilisateur
  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${userName}" ?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Erreur lors de la suppression');
      }

      setUsers(prev => prev.filter(user => user.id !== userId));
      toast.success('Utilisateur supprimé avec succès');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la suppression');
    }
  };

  // Fonction pour basculer le statut actif/inactif
  const handleToggleStatus = async (userId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Erreur lors de la mise à jour');
      }

      setUsers(prev => prev.map(user =>
        user.id === userId ? { ...user, isActive: !isActive } : user
      ));

      toast.success(`Utilisateur ${!isActive ? 'activé' : 'désactivé'} avec succès`);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la mise à jour');
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(date));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
    }).format(amount);
  };

  const getFullName = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.name || user.email;
  };

  return (
    <div className="space-y-6">
      {/* Header avec actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={tau('admin.users.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={handleUserAdded}
            className="flex items-center space-x-2"
          >
            <Users className="h-4 w-4" />
            <span>{tau('admin.users.refresh')}</span>
          </Button>

          <AddUserDialog onUserAdded={handleUserAdded} />
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">{tau('admin.users.totalUsers')}</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">{tau('admin.users.active')}</p>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.isActive).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">{tau('admin.users.withOrders')}</p>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.totalOrders > 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">{tau('admin.users.totalRevenue')}</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(users.reduce((sum, u) => sum + u.totalSpent, 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des utilisateurs */}
      <Card>
        <CardHeader>
          <CardTitle>
            Utilisateurs ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>{tau('admin.users.noneFound')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">{tau('admin.users.userCol')}</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">{tau('admin.users.contactCol')}</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">{tau('admin.users.ordersCol')}</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">{tau('admin.users.revenueCol')}</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">{tau('admin.users.statusCol')}</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">{tau('admin.users.createdAtCol')}</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">{tau('admin.users.actionsCol')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{getFullName(user)}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            {user.idCardNumber && (
                              <p className="text-xs text-gray-400">{tau('admin.users.cin')}: {user.idCardNumber}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          {user.phone && (
                            <p className="text-sm text-gray-900">{user.phone}</p>
                          )}
                          {user.address && (
                            <p className="text-sm text-gray-500">{user.address}</p>
                          )}
                          {user.city && (
                            <p className="text-sm text-gray-500">{user.city} {user.postalCode}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <ShoppingCart className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{user.totalOrders}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-medium text-green-600">
                          {formatCurrency(user.totalSpent)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <Badge
                          className={user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                        >
                          {user.isActive ? 'Actif' : 'Inactif'}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-600">
                          {formatDate(user.createdAt)}
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
                              <DropdownMenuItem onClick={() => setCreatingOrderFor(user)}>
                                <Plus className="h-4 w-4 mr-2" />
                                {tau('admin.users.createOrder')}
                              </DropdownMenuItem>
                              {user.totalOrders > 0 && (
                                <DropdownMenuItem onClick={() => setViewingOrdersFor(user)}>
                                  <ShoppingCart className="h-4 w-4 mr-2" />
                                  {tau('admin.users.viewOrders')} ({user.totalOrders})
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => setEditingUser(user)}>
                                <Edit className="h-4 w-4 mr-2" />
                                {tau('admin.users.modify')}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleToggleStatus(user.id, user.isActive)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                {user.isActive ? tau('admin.users.disable') : tau('admin.users.enable')}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteUser(user.id, getFullName(user))}
                                className="text-red-600 focus:text-red-600"
                                disabled={user.totalOrders > 0}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {tau('admin.users.delete')}
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
      {editingUser && (
        <EditUserDialog
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onUserUpdated={handleUserAdded}
        />
      )}

      {creatingOrderFor && (
        <CreateOrderDialog
          user={creatingOrderFor}
          onClose={() => setCreatingOrderFor(null)}
          onOrderCreated={handleUserAdded}
        />
      )}

      {viewingOrdersFor && (
        <UserOrdersDialog
          user={viewingOrdersFor}
          onClose={() => setViewingOrdersFor(null)}
        />
      )}
    </div>
  );
}

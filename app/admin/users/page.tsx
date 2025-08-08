import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { AdminUsersClient } from '@/components/admin/admin-users-client';

export const dynamic = 'force-dynamic';

async function getUsers() {
  const users = await db.user.findMany({
    include: {
      orders: {
        include: {
          orderItems: true
        }
      },
      invoices: true,
      _count: {
        select: {
          orders: true,
          invoices: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return users.map(user => ({
    ...user,
    totalOrders: user._count.orders,
    totalInvoices: user._count.invoices,
    totalSpent: user.orders.reduce((sum, order) => sum + Number(order.totalAmount), 0)
  }));
}

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/auth/connexion?error=AccessDenied');
  }

  const users = await getUsers();

  return (
    <AdminUsersClient 
      user={session.user}
      users={users}
    />
  );
}

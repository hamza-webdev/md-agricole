import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { AdminOrdersClient } from '@/components/admin/admin-orders-client';

export const dynamic = 'force-dynamic';

async function getOrders() {
  const orders = await db.order.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true
        }
      },
      orderItems: {
        include: {
          product: {
            select: {
              name: true,
              images: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return orders.map(order => ({
    ...order,
    totalAmount: Number(order.totalAmount)
  }));
}

export default async function AdminOrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/auth/connexion?error=AccessDenied');
  }

  const orders = await getOrders();

  return (
    <AdminOrdersClient 
      user={session.user}
      orders={orders}
    />
  );
}

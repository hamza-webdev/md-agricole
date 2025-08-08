import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { AdminDashboardClient } from '@/components/admin/admin-dashboard-client';

export const dynamic = 'force-dynamic';

async function getAdminStats() {
  const [
    totalUsers,
    totalProducts,
    totalOrders,
    totalRevenue,
    recentOrders,
    lowStockProducts
  ] = await Promise.all([
    db.user.count(),
    db.product.count(),
    db.order.count(),
    db.order.aggregate({
      _sum: {
        totalAmount: true
      }
    }),
    db.order.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    }),
    db.product.findMany({
      where: {
        stockQuantity: {
          lte: 5
        }
      },
      take: 5,
      select: {
        id: true,
        name: true,
        stockQuantity: true,
        category: {
          select: {
            name: true
          }
        }
      }
    })
  ]);

  return {
    totalUsers,
    totalProducts,
    totalOrders,
    totalRevenue: Number(totalRevenue._sum.totalAmount || 0),
    recentOrders: recentOrders.map(order => ({
      ...order,
      totalAmount: Number(order.totalAmount)
    })),
    lowStockProducts
  };
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/auth/connexion?error=AccessDenied');
  }

  const stats = await getAdminStats();

  return (
    <AdminDashboardClient
      user={session.user}
      stats={stats}
    />
  );
}

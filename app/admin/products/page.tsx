import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { AdminProductsClient } from '@/components/admin/admin-products-client';
import { convertPrismaProductToProduct } from '@/lib/utils';

export const dynamic = 'force-dynamic';

async function getProducts() {
  const products = await db.product.findMany({
    include: {
      category: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return products.map(convertPrismaProductToProduct);
}

async function getCategories() {
  return await db.category.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' }
  });
}

export default async function AdminProductsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/auth/connexion?error=AccessDenied');
  }

  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories()
  ]);

  return (
    <AdminProductsClient
      user={session.user}
      products={products}
      categories={categories}
    />
  );
}

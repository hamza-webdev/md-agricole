import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { AdminCategoriesClient } from '@/components/admin/admin-categories-client';

export const dynamic = 'force-dynamic';

async function getCategories() {
  const categories = await db.category.findMany({
    include: {
      _count: {
        select: {
          products: true
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  });

  return categories.map(category => ({
    ...category,
    productCount: category._count.products
  }));
}

export default async function AdminCategoriesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/auth/connexion?error=AccessDenied');
  }

  const categories = await getCategories();

  return (
    <AdminCategoriesClient 
      user={session.user}
      categories={categories}
    />
  );
}


import { CatalogueClient } from '@/components/catalogue/catalogue-client';
import { db } from '@/lib/db';
import { convertPrismaProductToProduct } from '@/lib/utils';

export const dynamic = 'force-dynamic';

async function getCategoriesAndProducts() {
  const categories = await db.category.findMany({
    where: { isActive: true },
    include: {
      _count: {
        select: { products: true }
      }
    },
    orderBy: { name: 'asc' }
  });

  const products = await db.product.findMany({
    where: { isActive: true },
    include: {
      category: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return {
    categories: categories.map((cat: any) => ({
      ...cat,
      productCount: cat._count.products
    })),
    products: products.map(product => convertPrismaProductToProduct(product))
  };
}

export default async function CataloguePage() {
  const { categories, products } = await getCategoriesAndProducts();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Catalogue de Matériel Agricole
        </h1>
        <p className="text-muted-foreground">
          Découvrez notre gamme complète de tracteurs, outils et équipements agricoles
        </p>
      </div>

      <CatalogueClient 
        initialCategories={categories} 
        initialProducts={products} 
      />
    </div>
  );
}

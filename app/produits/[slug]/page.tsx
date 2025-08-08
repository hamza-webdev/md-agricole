
import { notFound } from 'next/navigation';
import { ProductDetails } from '@/components/products/product-details';
import { db } from '@/lib/db';
import { Product } from '@/lib/types';
import { convertPrismaProductToProduct } from '@/lib/utils';

export const dynamic = 'force-dynamic';

async function getProduct(slug: string) {
  const product = await db.product.findUnique({
    where: { slug },
    include: {
      category: true
    }
  });

  return product;
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const prismaProduct = await getProduct(params.slug);

  if (!prismaProduct) {
    notFound();
  }

  // Convertir le produit Prisma vers le type Product
  const product: Product = convertPrismaProductToProduct(prismaProduct);

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductDetails product={product} />
    </div>
  );
}

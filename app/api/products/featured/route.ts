
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { convertPrismaProductToProduct } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const featuredProducts = await db.product.findMany({
      where: {
        isActive: true,
        isFeatured: true,
      },
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 6,
    });

    // Convertir les produits Prisma vers le type Product
    const productsWithCorrectTypes = featuredProducts.map(convertPrismaProductToProduct);

    return NextResponse.json(productsWithCorrectTypes);
  } catch (error) {
    console.error('Erreur lors de la récupération des produits vedettes:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

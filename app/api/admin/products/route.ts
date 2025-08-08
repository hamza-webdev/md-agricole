import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';
import { convertPrismaProductToProduct } from '@/lib/utils';

// Schéma de validation pour un nouveau produit
const createProductSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  description: z.string().min(1, 'La description est requise'),
  price: z.number().min(0, 'Le prix doit être positif'),
  brand: z.string().optional(),
  model: z.string().optional(),
  power: z.string().optional(),
  features: z.array(z.string()).optional(),
  stockQuantity: z.number().min(0, 'La quantité doit être positive'),
  categoryId: z.string().min(1, 'La catégorie est requise'),
  images: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Début de la création de produit');

    // Vérifier l'authentification et le rôle admin
    const session = await getServerSession(authOptions);
    console.log('👤 Session:', session?.user?.email, session?.user?.role);

    if (!session?.user || session.user.role !== 'ADMIN') {
      console.log('❌ Non autorisé');
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Parser et valider les données
    const body = await request.json();
    console.log('📝 Données reçues:', body);

    const validatedData = createProductSchema.parse(body);
    console.log('✅ Données validées:', validatedData);

    // Générer un slug unique à partir du nom
    const baseSlug = validatedData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Vérifier l'unicité du slug
    let slug = baseSlug;
    let counter = 1;
    while (await db.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Créer le produit
    console.log('💾 Création du produit avec slug:', slug);
    const product = await db.product.create({
      data: {
        name: validatedData.name,
        slug,
        description: validatedData.description,
        price: validatedData.price,
        brand: validatedData.brand || null,
        model: validatedData.model || null,
        power: validatedData.power || null,
        features: validatedData.features || [],
        stockQuantity: validatedData.stockQuantity,
        categoryId: validatedData.categoryId,
        images: validatedData.images || [],
        isActive: validatedData.isActive ?? true,
        isFeatured: validatedData.isFeatured ?? false,
      },
      include: {
        category: true
      }
    });
    console.log('✅ Produit créé:', product.id);

    const convertedProduct = convertPrismaProductToProduct(product);

    return NextResponse.json({
      success: true,
      message: 'Produit créé avec succès',
      product: convertedProduct
    });

  } catch (error) {
    console.error('❌ Erreur lors de la création du produit:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'Pas de stack trace');

    if (error instanceof z.ZodError) {
      console.error('🔍 Erreurs de validation Zod:', error.errors);
      return NextResponse.json(
        {
          error: 'Données invalides',
          details: error.errors
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Erreur interne du serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Vérifier l'authentification et le rôle admin
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Récupérer tous les produits
    const products = await db.product.findMany({
      include: {
        category: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const convertedProducts = products.map(convertPrismaProductToProduct);
    return NextResponse.json(convertedProducts);

  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

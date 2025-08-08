import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';
import { convertPrismaProductToProduct } from '@/lib/utils';

// Schéma de validation pour la modification d'un produit
const updateProductSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').optional(),
  description: z.string().min(1, 'La description est requise').optional(),
  price: z.number().min(0, 'Le prix doit être positif').optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  power: z.string().optional(),
  features: z.array(z.string()).optional(),
  stockQuantity: z.number().min(0, 'La quantité doit être positive').optional(),
  categoryId: z.string().min(1, 'La catégorie est requise').optional(),
  images: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔄 Début de la modification de produit:', params.id);
    
    // Vérifier l'authentification et le rôle admin
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const productId = params.id;

    // Vérifier que le produit existe
    const existingProduct = await db.product.findUnique({
      where: { id: productId }
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Produit non trouvé' },
        { status: 404 }
      );
    }

    // Parser et valider les données
    const body = await request.json();
    const validatedData = updateProductSchema.parse(body);

    // Préparer les données de mise à jour
    const updateData: any = { ...validatedData };

    // Générer un nouveau slug si le nom change
    if (validatedData.name && validatedData.name !== existingProduct.name) {
      const baseSlug = validatedData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Vérifier l'unicité du slug
      let slug = baseSlug;
      let counter = 1;
      while (await db.product.findFirst({ 
        where: { 
          slug,
          id: { not: productId }
        } 
      })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      updateData.slug = slug;
    }

    // Mettre à jour le produit
    const updatedProduct = await db.product.update({
      where: { id: productId },
      data: updateData,
      include: {
        category: true
      }
    });

    const convertedProduct = convertPrismaProductToProduct(updatedProduct);

    return NextResponse.json({
      success: true,
      message: 'Produit mis à jour avec succès',
      product: convertedProduct
    });

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour du produit:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Données invalides',
          details: error.errors
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🗑️ Début de la suppression de produit:', params.id);
    
    // Vérifier l'authentification et le rôle admin
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const productId = params.id;

    // Vérifier que le produit existe
    const existingProduct = await db.product.findUnique({
      where: { id: productId },
      include: {
        orderItems: true
      }
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Produit non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier qu'il n'y a pas de commandes associées
    if (existingProduct.orderItems.length > 0) {
      return NextResponse.json(
        { 
          error: `Impossible de supprimer ce produit car il est présent dans ${existingProduct.orderItems.length} commande(s). Vous pouvez le désactiver à la place.`
        },
        { status: 400 }
      );
    }

    // Supprimer le produit
    await db.product.delete({
      where: { id: productId }
    });

    return NextResponse.json({
      success: true,
      message: 'Produit supprimé avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur lors de la suppression du produit:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

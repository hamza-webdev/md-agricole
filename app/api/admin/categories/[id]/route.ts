import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

// Schéma de validation pour la modification d'une catégorie
const updateCategorySchema = z.object({
  name: z.string().min(1, 'Le nom est requis').optional(),
  description: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification et le rôle admin
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const categoryId = params.id;

    // Vérifier que la catégorie existe
    const existingCategory = await db.category.findUnique({
      where: { id: categoryId }
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Catégorie non trouvée' },
        { status: 404 }
      );
    }

    // Parser et valider les données
    const body = await request.json();
    const validatedData = updateCategorySchema.parse(body);

    // Préparer les données de mise à jour
    const updateData: any = {};

    if (validatedData.name !== undefined) {
      updateData.name = validatedData.name;
      
      // Générer un nouveau slug si le nom change
      if (validatedData.name !== existingCategory.name) {
        const baseSlug = validatedData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        // Vérifier l'unicité du slug
        let slug = baseSlug;
        let counter = 1;
        while (await db.category.findFirst({ 
          where: { 
            slug,
            id: { not: categoryId }
          } 
        })) {
          slug = `${baseSlug}-${counter}`;
          counter++;
        }
        updateData.slug = slug;
      }
    }

    if (validatedData.description !== undefined) {
      updateData.description = validatedData.description;
    }

    if (validatedData.isActive !== undefined) {
      updateData.isActive = validatedData.isActive;
    }

    // Mettre à jour la catégorie
    const updatedCategory = await db.category.update({
      where: { id: categoryId },
      data: updateData,
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Catégorie mise à jour avec succès',
      category: updatedCategory
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de la catégorie:', error);

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
    // Vérifier l'authentification et le rôle admin
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const categoryId = params.id;

    // Vérifier que la catégorie existe
    const existingCategory = await db.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Catégorie non trouvée' },
        { status: 404 }
      );
    }

    // Vérifier qu'il n'y a pas de produits associés
    if (existingCategory._count.products > 0) {
      return NextResponse.json(
        { 
          error: `Impossible de supprimer cette catégorie car elle contient ${existingCategory._count.products} produit(s). Veuillez d'abord déplacer ou supprimer les produits.`
        },
        { status: 400 }
      );
    }

    // Supprimer la catégorie
    await db.category.delete({
      where: { id: categoryId }
    });

    return NextResponse.json({
      success: true,
      message: 'Catégorie supprimée avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de la catégorie:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

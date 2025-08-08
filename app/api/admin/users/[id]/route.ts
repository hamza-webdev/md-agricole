import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

// Schéma de validation pour la modification d'un utilisateur
const updateUserSchema = z.object({
  email: z.string().email('Email invalide').optional(),
  firstName: z.string().min(1, 'Le prénom est requis').optional(),
  lastName: z.string().min(1, 'Le nom est requis').optional(),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  postalCode: z.string().nullable().optional(),
  idCardNumber: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔄 Début de la modification d\'utilisateur:', params.id);
    
    // Vérifier l'authentification et le rôle admin
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const userId = params.id;

    // Vérifier que l'utilisateur existe
    const existingUser = await db.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Parser et valider les données
    const body = await request.json();
    const validatedData = updateUserSchema.parse(body);

    // Vérifier l'unicité de l'email (si modifié)
    if (validatedData.email && validatedData.email !== existingUser.email) {
      const emailExists = await db.user.findUnique({
        where: { email: validatedData.email }
      });

      if (emailExists) {
        return NextResponse.json(
          { error: 'Un utilisateur avec cet email existe déjà' },
          { status: 400 }
        );
      }
    }

    // Vérifier l'unicité du numéro CIN (si modifié)
    if (validatedData.idCardNumber && validatedData.idCardNumber !== existingUser.idCardNumber) {
      const idCardExists = await db.user.findUnique({
        where: { idCardNumber: validatedData.idCardNumber }
      });

      if (idCardExists) {
        return NextResponse.json(
          { error: 'Un utilisateur avec ce numéro de CIN existe déjà' },
          { status: 400 }
        );
      }
    }

    // Préparer les données de mise à jour
    const updateData: any = { ...validatedData };

    // Mettre à jour le nom complet si prénom ou nom changent
    if (validatedData.firstName || validatedData.lastName) {
      const firstName = validatedData.firstName || existingUser.firstName;
      const lastName = validatedData.lastName || existingUser.lastName;
      updateData.name = `${firstName} ${lastName}`;
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: updateData,
    });

    // Retourner l'utilisateur mis à jour (sans le mot de passe)
    const { password, ...userWithoutPassword } = updatedUser;

    return NextResponse.json({
      success: true,
      message: 'Utilisateur mis à jour avec succès',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour de l\'utilisateur:', error);

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
    console.log('🗑️ Début de la suppression d\'utilisateur:', params.id);
    
    // Vérifier l'authentification et le rôle admin
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const userId = params.id;

    // Vérifier que l'utilisateur existe
    const existingUser = await db.user.findUnique({
      where: { id: userId },
      include: {
        orders: true,
        invoices: true
      }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier qu'il n'y a pas de commandes ou factures associées
    if (existingUser.orders.length > 0 || existingUser.invoices.length > 0) {
      return NextResponse.json(
        { 
          error: `Impossible de supprimer cet utilisateur car il a ${existingUser.orders.length} commande(s) et ${existingUser.invoices.length} facture(s). Vous pouvez le désactiver à la place.`
        },
        { status: 400 }
      );
    }

    // Supprimer l'utilisateur
    await db.user.delete({
      where: { id: userId }
    });

    return NextResponse.json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur lors de la suppression de l\'utilisateur:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

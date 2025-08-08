import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

// Schéma de validation pour un nouveau utilisateur
const createUserSchema = z.object({
  email: z.string().email('Email invalide'),
  firstName: z.string().min(1, 'Le prénom est requis'),
  lastName: z.string().min(1, 'Le nom est requis'),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  idCardNumber: z.string().optional(),
  isActive: z.boolean().optional(),
});

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

    const users = await db.user.findMany({
      include: {
        orders: {
          include: {
            orderItems: true
          }
        },
        invoices: true,
        _count: {
          select: {
            orders: true,
            invoices: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const usersWithStats = users.map(user => ({
      ...user,
      totalOrders: user._count.orders,
      totalInvoices: user._count.invoices,
      totalSpent: user.orders.reduce((sum, order) => sum + Number(order.totalAmount), 0)
    }));

    return NextResponse.json(usersWithStats);

  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Début de la création d\'utilisateur');
    
    // Vérifier l'authentification et le rôle admin
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Parser et valider les données
    const body = await request.json();
    console.log('📝 Données reçues:', body);
    
    const validatedData = createUserSchema.parse(body);
    console.log('✅ Données validées:', validatedData);

    // Vérifier que l'email n'existe pas déjà
    const existingUser = await db.user.findUnique({
      where: { email: validatedData.email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un utilisateur avec cet email existe déjà' },
        { status: 400 }
      );
    }

    // Vérifier que le numéro CIN n'existe pas déjà (s'il est fourni)
    if (validatedData.idCardNumber) {
      const existingIdCard = await db.user.findUnique({
        where: { idCardNumber: validatedData.idCardNumber }
      });

      if (existingIdCard) {
        return NextResponse.json(
          { error: 'Un utilisateur avec ce numéro de CIN existe déjà' },
          { status: 400 }
        );
      }
    }

    // Générer un mot de passe temporaire
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    // Créer l'utilisateur
    console.log('💾 Création de l\'utilisateur...');
    const user = await db.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: `${validatedData.firstName} ${validatedData.lastName}`,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        phone: validatedData.phone || null,
        address: validatedData.address || null,
        city: validatedData.city || null,
        postalCode: validatedData.postalCode || null,
        idCardNumber: validatedData.idCardNumber || null,
        role: 'CUSTOMER',
        isActive: validatedData.isActive ?? true,
      },
    });

    console.log('✅ Utilisateur créé:', user.id);

    // Retourner l'utilisateur créé (sans le mot de passe)
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      message: 'Utilisateur créé avec succès',
      user: userWithoutPassword,
      tempPassword // En production, envoyer par email
    });

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'utilisateur:', error);

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

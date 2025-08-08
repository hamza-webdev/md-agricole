
import { NextRequest, NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, address, city, password } = await request.json();

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await db.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Un compte avec cet email existe déjà' },
        { status: 400 }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await bcryptjs.hash(password, 12);

    // Créer l'utilisateur
    const user = await db.user.create({
      data: {
        name,
        email,
        phone,
        address,
        city,
        password: hashedPassword,
        role: 'CUSTOMER',
        isActive: true
      }
    });

    // Retourner l'utilisateur sans le mot de passe
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      message: 'Compte créé avec succès',
      user: userWithoutPassword
    }, { status: 201 });

  } catch (error) {
    console.error('Erreur lors de la création du compte:', error);
    return NextResponse.json(
      { message: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

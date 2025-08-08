
import { NextRequest, NextResponse } from 'next/server';

// Simuler une table de messages de contact - en production, vous pourriez vouloir les stocker en base
const contactMessages: Array<{
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  createdAt: string;
}> = [];

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, subject, message } = await request.json();

    // Validation basique
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { message: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      );
    }

    // Créer le message de contact
    const contactMessage = {
      id: `contact_${Date.now()}`,
      name,
      email,
      phone: phone || null,
      subject,
      message,
      createdAt: new Date().toISOString()
    };

    // Stocker en mémoire (en production, sauvegarder en base de données)
    contactMessages.push(contactMessage);

    // Log pour le développement
    console.log('Nouveau message de contact reçu:', {
      name,
      email,
      subject: subject.slice(0, 50) + '...',
      date: new Date().toLocaleString('fr-FR')
    });

    return NextResponse.json({
      message: 'Votre message a été envoyé avec succès',
      id: contactMessage.id
    }, { status: 201 });

  } catch (error) {
    console.error('Erreur lors de l\'envoi du message de contact:', error);
    return NextResponse.json(
      { message: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Endpoint pour l'admin (facultatif)
  try {
    return NextResponse.json(contactMessages);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

// Schéma de validation pour un nouveau paiement
const createPaymentSchema = z.object({
  invoiceId: z.string().min(1, 'La facture est requise'),
  amount: z.number().min(0.01, 'Le montant doit être supérieur à 0'),
  paymentMethod: z.enum(['CASH', 'CHECK', 'CARD', 'CREDIT', 'BANK_TRANSFER']),
  notes: z.string().optional(),
  checkNumber: z.string().optional(),
  cardLast4: z.string().optional(),
  transactionId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Début de la création de paiement');
    
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
    
    const validatedData = createPaymentSchema.parse(body);
    console.log('✅ Données validées:', validatedData);

    // Vérifier que la facture existe
    const invoice = await db.invoice.findUnique({
      where: { id: validatedData.invoiceId },
      include: {
        payments: {
          where: {
            status: 'COMPLETED'
          }
        }
      }
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Facture non trouvée' },
        { status: 404 }
      );
    }

    // Calculer le montant déjà payé
    const totalPaid = invoice.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
    const remainingAmount = Number(invoice.totalAmount) - totalPaid;

    // Vérifier que le montant ne dépasse pas le reste à payer
    if (validatedData.amount > remainingAmount) {
      return NextResponse.json(
        { error: `Le montant ne peut pas dépasser le reste à payer (${remainingAmount} TND)` },
        { status: 400 }
      );
    }

    // Générer un numéro de paiement unique
    const paymentCount = await db.payment.count();
    const paymentNumber = `PAY-${String(paymentCount + 1).padStart(6, '0')}`;

    // Créer le paiement dans une transaction
    const result = await db.$transaction(async (prisma) => {
      // Créer le paiement
      const payment = await prisma.payment.create({
        data: {
          paymentNumber,
          amount: validatedData.amount,
          paymentMethod: validatedData.paymentMethod,
          status: 'COMPLETED', // Paiement admin directement complété
          notes: validatedData.notes,
          checkNumber: validatedData.checkNumber,
          cardLast4: validatedData.cardLast4,
          transactionId: validatedData.transactionId,
          invoiceId: validatedData.invoiceId,
        }
      });

      // Calculer le nouveau total payé
      const newTotalPaid = totalPaid + validatedData.amount;
      const newRemainingAmount = Number(invoice.totalAmount) - newTotalPaid;

      // Mettre à jour le statut de la facture si entièrement payée
      if (newRemainingAmount <= 0.01) { // Tolérance pour les arrondis
        await prisma.invoice.update({
          where: { id: validatedData.invoiceId },
          data: { status: 'PAID' }
        });
      }

      return payment;
    });

    console.log('✅ Paiement créé:', result.paymentNumber);

    return NextResponse.json({
      success: true,
      message: 'Paiement enregistré avec succès',
      payment: result
    });

  } catch (error) {
    console.error('❌ Erreur lors de la création du paiement:', error);

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

    const payments = await db.payment.findMany({
      include: {
        invoice: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            },
            order: {
              select: {
                orderNumber: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(payments);

  } catch (error) {
    console.error('Erreur lors de la récupération des paiements:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

// Schéma de validation pour une nouvelle facture
const createInvoiceSchema = z.object({
  orderId: z.string().min(1, 'La commande est requise'),
  taxAmount: z.number().min(0, 'Le montant de la TVA doit être positif').optional(),
  discountAmount: z.number().min(0, 'Le montant de la remise doit être positif').optional(),
  notes: z.string().optional(),
  dueDate: z.string().optional(),
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

    const invoices = await db.invoice.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            address: true,
            city: true
          }
        },
        order: {
          include: {
            orderItems: {
              include: {
                product: {
                  select: {
                    name: true,
                    images: true
                  }
                }
              }
            }
          }
        },
        payments: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            payments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const invoicesWithStats = invoices.map(invoice => ({
      ...invoice,
      totalPaid: invoice.payments.reduce((sum, payment) => 
        payment.status === 'COMPLETED' ? sum + Number(payment.amount) : sum, 0
      ),
      remainingAmount: Number(invoice.totalAmount) - invoice.payments.reduce((sum, payment) => 
        payment.status === 'COMPLETED' ? sum + Number(payment.amount) : sum, 0
      ),
      paymentCount: invoice._count.payments
    }));

    return NextResponse.json(invoicesWithStats);

  } catch (error) {
    console.error('Erreur lors de la récupération des factures:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Début de la création de facture');
    
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
    
    const validatedData = createInvoiceSchema.parse(body);
    console.log('✅ Données validées:', validatedData);

    // Vérifier que la commande existe et n'a pas déjà de facture
    const order = await db.order.findUnique({
      where: { id: validatedData.orderId },
      include: {
        user: true,
        invoice: true,
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Commande non trouvée' },
        { status: 404 }
      );
    }

    if (order.invoice) {
      return NextResponse.json(
        { error: 'Cette commande a déjà une facture' },
        { status: 400 }
      );
    }

    // Calculer le montant total de la facture
    const baseAmount = Number(order.totalAmount);
    const taxAmount = validatedData.taxAmount || 0;
    const discountAmount = validatedData.discountAmount || 0;
    const totalAmount = baseAmount + taxAmount - discountAmount;

    if (totalAmount < 0) {
      return NextResponse.json(
        { error: 'Le montant total de la facture ne peut pas être négatif' },
        { status: 400 }
      );
    }

    // Générer un numéro de facture unique
    const invoiceCount = await db.invoice.count();
    const invoiceNumber = `FAC-${String(invoiceCount + 1).padStart(6, '0')}`;

    // Créer la facture
    console.log('💾 Création de la facture...');
    const invoice = await db.invoice.create({
      data: {
        invoiceNumber,
        status: 'PENDING',
        totalAmount,
        taxAmount,
        discountAmount,
        notes: validatedData.notes,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        orderId: validatedData.orderId,
        userId: order.userId,
      },
      include: {
        user: true,
        order: {
          include: {
            orderItems: {
              include: {
                product: true
              }
            }
          }
        }
      }
    });

    console.log('✅ Facture créée:', invoice.invoiceNumber);

    return NextResponse.json({
      success: true,
      message: 'Facture créée avec succès',
      invoice
    });

  } catch (error) {
    console.error('❌ Erreur lors de la création de la facture:', error);

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

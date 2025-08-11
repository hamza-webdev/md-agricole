import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';
import { decimalToNumber } from '@/lib/decimal-utils';

// Schéma de validation pour la modification d'une facture
const updateInvoiceSchema = z.object({
  status: z.enum(['PENDING', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED']).optional(),
  taxAmount: z.number().min(0).optional(),
  discountAmount: z.number().min(0).optional(),
  notes: z.string().optional(),
  dueDate: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔄 Début de la modification de facture:', params.id);
    
    // Vérifier l'authentification et le rôle admin
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const invoiceId = params.id;

    // Vérifier que la facture existe
    const existingInvoice = await db.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        order: true,
        payments: {
          where: {
            status: 'COMPLETED'
          }
        }
      }
    });

    if (!existingInvoice) {
      return NextResponse.json(
        { error: 'Facture non trouvée' },
        { status: 404 }
      );
    }

    // Parser et valider les données
    const body = await request.json();
    const validatedData = updateInvoiceSchema.parse(body);

    // Préparer les données de mise à jour
    const updateData: any = {};

    if (validatedData.status !== undefined) {
      updateData.status = validatedData.status;
    }

    if (validatedData.taxAmount !== undefined) {
      updateData.taxAmount = validatedData.taxAmount;
    }

    if (validatedData.discountAmount !== undefined) {
      updateData.discountAmount = validatedData.discountAmount;
    }

    if (validatedData.notes !== undefined) {
      updateData.notes = validatedData.notes;
    }

    if (validatedData.dueDate !== undefined) {
      updateData.dueDate = validatedData.dueDate ? new Date(validatedData.dueDate) : null;
    }

    // Recalculer le montant total si les taxes ou remises changent
    if (validatedData.taxAmount !== undefined || validatedData.discountAmount !== undefined) {
      const baseAmount = decimalToNumber(existingInvoice.order.totalAmount);
      const taxAmount = validatedData.taxAmount ?? decimalToNumber(existingInvoice.taxAmount);
      const discountAmount = validatedData.discountAmount ?? decimalToNumber(existingInvoice.discountAmount);
      const newTotalAmount = baseAmount + taxAmount - discountAmount;

      if (newTotalAmount < 0) {
        return NextResponse.json(
          { error: 'Le montant total de la facture ne peut pas être négatif' },
          { status: 400 }
        );
      }

      updateData.totalAmount = newTotalAmount;

      // Vérifier que le nouveau total n'est pas inférieur au montant déjà payé
      const totalPaid = existingInvoice.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
      if (newTotalAmount < totalPaid) {
        return NextResponse.json(
          { error: `Le nouveau montant total (${newTotalAmount} TND) ne peut pas être inférieur au montant déjà payé (${totalPaid} TND)` },
          { status: 400 }
        );
      }
    }

    // Mettre à jour la facture
    const updatedInvoice = await db.invoice.update({
      where: { id: invoiceId },
      data: updateData,
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
        },
        payments: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Facture mise à jour avec succès',
      invoice: updatedInvoice
    });

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour de la facture:', error);

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
    console.log('🗑️ Début de la suppression de facture:', params.id);
    
    // Vérifier l'authentification et le rôle admin
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const invoiceId = params.id;

    // Vérifier que la facture existe
    const existingInvoice = await db.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        payments: true
      }
    });

    if (!existingInvoice) {
      return NextResponse.json(
        { error: 'Facture non trouvée' },
        { status: 404 }
      );
    }

    // Vérifier qu'il n'y a pas de paiements associés
    if (existingInvoice.payments.length > 0) {
      return NextResponse.json(
        { 
          error: `Impossible de supprimer cette facture car elle a ${existingInvoice.payments.length} paiement(s) associé(s).`
        },
        { status: 400 }
      );
    }

    // Supprimer la facture
    await db.invoice.delete({
      where: { id: invoiceId }
    });

    return NextResponse.json({
      success: true,
      message: 'Facture supprimée avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur lors de la suppression de la facture:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { AdminInvoicesClient } from '@/components/admin/admin-invoices-client';
import { decimalToNumber } from '@/lib/decimal-utils';

export const dynamic = 'force-dynamic';

async function getInvoices() {
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

  return invoices.map(invoice => {
    // Calculer le total payé
    const totalPaid = invoice.payments.reduce((sum, payment) =>
      payment.status === 'COMPLETED' ? sum + decimalToNumber(payment.amount) : sum, 0
    );

    // Convertir le montant total
    const totalAmount = decimalToNumber(invoice.totalAmount);

    return {
      ...invoice,
      // Convertir les types Decimal en number
      totalAmount,
      taxAmount: decimalToNumber(invoice.taxAmount),
      discountAmount: decimalToNumber(invoice.discountAmount),
      // Calculer les montants payés et restants
      totalPaid,
      remainingAmount: totalAmount - totalPaid,
      paymentCount: invoice._count.payments,
      // Convertir les montants des items de commande
      order: {
        ...invoice.order,
        orderItems: invoice.order.orderItems.map(item => ({
          ...item,
          unitPrice: decimalToNumber(item.unitPrice)
        }))
      },
      // Convertir les montants des paiements
      payments: invoice.payments.map(payment => ({
        ...payment,
        amount: decimalToNumber(payment.amount)
      }))
    };
  });
}

export default async function AdminInvoicesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/auth/connexion?error=AccessDenied');
  }

  const invoices = await getInvoices();

  return (
    <AdminInvoicesClient 
      user={session.user}
      invoices={invoices}
    />
  );
}

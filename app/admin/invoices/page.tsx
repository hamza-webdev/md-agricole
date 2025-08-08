import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { AdminInvoicesClient } from '@/components/admin/admin-invoices-client';

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

  return invoices.map(invoice => ({
    ...invoice,
    totalPaid: invoice.payments.reduce((sum, payment) => 
      payment.status === 'COMPLETED' ? sum + Number(payment.amount) : sum, 0
    ),
    remainingAmount: Number(invoice.totalAmount) - invoice.payments.reduce((sum, payment) => 
      payment.status === 'COMPLETED' ? sum + Number(payment.amount) : sum, 0
    ),
    paymentCount: invoice._count.payments
  }));
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

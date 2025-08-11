import { PrismaClient, InvoiceStatus, PaymentMethod, PaymentStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function seedInvoices() {
  console.log('🚀 Début du seeding des factures...');

  try {
    // Récupérer les commandes sans facture
    const ordersWithoutInvoice = await prisma.order.findMany({
      where: {
        invoice: null,
        status: {
          in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED']
        }
      },
      include: {
        user: true
      }
    });

    console.log(`📦 ${ordersWithoutInvoice.length} commandes trouvées sans facture`);

    if (ordersWithoutInvoice.length === 0) {
      console.log('✅ Aucune commande sans facture trouvée');
      return;
    }

    // Créer des factures pour ces commandes
    for (let i = 0; i < ordersWithoutInvoice.length; i++) {
      const order = ordersWithoutInvoice[i];
      
      // Générer un numéro de facture
      const invoiceCount = await prisma.invoice.count();
      const invoiceNumber = `FAC-${String(invoiceCount + 1).padStart(6, '0')}`;

      // Calculer les montants
      const baseAmount = Number(order.totalAmount);
      const taxAmount = Math.round(baseAmount * 0.19 * 100) / 100; // 19% TVA
      const discountAmount = i % 3 === 0 ? Math.round(baseAmount * 0.05 * 100) / 100 : 0; // 5% remise pour 1/3 des factures
      const totalAmount = baseAmount + taxAmount - discountAmount;

      // Date d'échéance : 30 jours après création
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);

      // Statut aléatoire
      const statuses = [InvoiceStatus.PENDING, InvoiceStatus.SENT, InvoiceStatus.PAID];
      const status = statuses[i % statuses.length];

      console.log(`📄 Création facture ${invoiceNumber} pour commande ${order.orderNumber}`);

      const invoice = await prisma.invoice.create({
        data: {
          invoiceNumber,
          status,
          totalAmount,
          taxAmount,
          discountAmount,
          notes: i % 2 === 0 ? 'Facture générée automatiquement' : undefined,
          dueDate,
          orderId: order.id,
          userId: order.userId,
        }
      });

      // Créer des paiements pour les factures payées
      if (status === InvoiceStatus.PAID) {
        const paymentCount = await prisma.payment.count();
        const paymentNumber = `PAY-${String(paymentCount + 1).padStart(6, '0')}`;

        // Méthodes de paiement aléatoires
        const paymentMethods = [PaymentMethod.CASH, PaymentMethod.CHECK, PaymentMethod.CARD, PaymentMethod.BANK_TRANSFER];
        const paymentMethod = paymentMethods[i % paymentMethods.length];

        await prisma.payment.create({
          data: {
            paymentNumber,
            amount: totalAmount,
            paymentMethod,
            status: PaymentStatus.COMPLETED,
            notes: `Paiement par ${paymentMethod.toLowerCase()}`,
            checkNumber: paymentMethod === 'CHECK' ? `CHK${Math.floor(Math.random() * 1000000)}` : undefined,
            cardLast4: paymentMethod === 'CARD' ? `${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}` : undefined,
            transactionId: ['CARD', 'BANK_TRANSFER'].includes(paymentMethod) ? `TXN${Math.floor(Math.random() * 1000000)}` : undefined,
            invoiceId: invoice.id,
          }
        });

        console.log(`💳 Paiement créé pour facture ${invoiceNumber}`);
      }
    }

    console.log('✅ Seeding des factures terminé avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors du seeding des factures:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  seedInvoices()
    .then(() => {
      console.log('🎉 Script terminé avec succès');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erreur fatale:', error);
      process.exit(1);
    });
}

export default seedInvoices;

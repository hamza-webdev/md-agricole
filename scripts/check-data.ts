import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkData() {
  console.log('🔍 Vérification des données...');

  try {
    // Vérifier les utilisateurs
    const userCount = await prisma.user.count();
    console.log(`👥 Utilisateurs: ${userCount}`);

    // Vérifier les commandes
    const orderCount = await prisma.order.count();
    console.log(`📦 Commandes: ${orderCount}`);

    // Vérifier les commandes sans facture
    const ordersWithoutInvoice = await prisma.order.count({
      where: {
        invoice: null,
        status: {
          in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED']
        }
      }
    });
    console.log(`📦 Commandes sans facture: ${ordersWithoutInvoice}`);

    // Vérifier les factures
    const invoiceCount = await prisma.invoice.count();
    console.log(`🧾 Factures: ${invoiceCount}`);

    // Lister quelques commandes
    const orders = await prisma.order.findMany({
      take: 5,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        invoice: {
          select: {
            id: true,
            invoiceNumber: true
          }
        }
      }
    });

    console.log('\n📋 Quelques commandes:');
    orders.forEach(order => {
      console.log(`- ${order.orderNumber} | ${order.user.firstName} ${order.user.lastName} | ${order.status} | Facture: ${order.invoice ? order.invoice.invoiceNumber : 'Aucune'}`);
    });

    // Lister les commandes sans facture
    const ordersWithoutInvoiceList = await prisma.order.findMany({
      where: {
        invoice: null,
        status: {
          in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED']
        }
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    console.log('\n📋 Commandes sans facture:');
    if (ordersWithoutInvoiceList.length === 0) {
      console.log('Aucune commande sans facture trouvée');
    } else {
      ordersWithoutInvoiceList.forEach(order => {
        console.log(`- ${order.orderNumber} | ${order.user.firstName} ${order.user.lastName} | ${order.status} | ${order.totalAmount} TND`);
      });
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  checkData()
    .then(() => {
      console.log('\n✅ Vérification terminée');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erreur fatale:', error);
      process.exit(1);
    });
}

export default checkData;

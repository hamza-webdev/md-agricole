import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestOrders() {
  console.log('🚀 Création de commandes de test...');

  try {
    // Récupérer les utilisateurs existants
    const users = await prisma.user.findMany({
      where: {
        role: 'CUSTOMER'
      }
    });

    if (users.length === 0) {
      console.log('❌ Aucun utilisateur client trouvé');
      return;
    }

    // Récupérer quelques produits
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        stockQuantity: {
          gt: 0
        }
      },
      take: 3
    });

    if (products.length === 0) {
      console.log('❌ Aucun produit disponible trouvé');
      return;
    }

    console.log(`👥 ${users.length} utilisateurs trouvés`);
    console.log(`📦 ${products.length} produits disponibles`);

    // Créer 3 commandes de test
    for (let i = 0; i < 3; i++) {
      const user = users[i % users.length];
      const product = products[i % products.length];

      // Générer un numéro de commande
      const orderCount = await prisma.order.count();
      const orderNumber = `CMD-${String(orderCount + 1).padStart(6, '0')}`;

      const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 quantité
      const unitPrice = Number(product.price);
      const totalAmount = quantity * unitPrice;

      console.log(`📝 Création commande ${orderNumber} pour ${user.firstName} ${user.lastName}`);

      // Créer la commande
      const order = await prisma.order.create({
        data: {
          orderNumber,
          status: i === 0 ? 'PENDING' : 'CONFIRMED', // Première commande en PENDING, autres en CONFIRMED
          totalAmount,
          notes: `Commande de test ${i + 1}`,
          customerName: `${user.firstName} ${user.lastName}`,
          customerEmail: user.email,
          customerPhone: user.phone || '',
          deliveryAddress: user.address || 'Adresse de test',
          deliveryCity: user.city || 'Tunis',
          deliveryPostalCode: user.postalCode || '1000',
          userId: user.id,
        }
      });

      // Créer l'article de commande
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: product.id,
          quantity,
          unitPrice,
        }
      });

      // Mettre à jour le stock
      await prisma.product.update({
        where: { id: product.id },
        data: {
          stockQuantity: {
            decrement: quantity
          }
        }
      });

      console.log(`✅ Commande ${orderNumber} créée avec ${quantity}x ${product.name}`);
    }

    console.log('✅ Commandes de test créées avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors de la création des commandes:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  createTestOrders()
    .then(() => {
      console.log('🎉 Script terminé avec succès');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erreur fatale:', error);
      process.exit(1);
    });
}

export default createTestOrders;

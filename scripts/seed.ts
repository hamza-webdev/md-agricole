import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Début du seeding simple...');

  // Nettoyer
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  // Créer catégories
  const tractorsCategory = await prisma.category.create({
    data: {
      name: 'Tracteurs',
      slug: 'tracteurs',
      description: 'Tracteurs agricoles de toutes puissances'
    }
  });

  const toolsCategory = await prisma.category.create({
    data: {
      name: 'Outils agricoles',
      slug: 'outils-agricoles',
      description: 'Outils et équipements pour l\'agriculture'
    }
  });

  const irrigationCategory = await prisma.category.create({
    data: {
      name: 'Irrigation',
      slug: 'irrigation',
      description: 'Systèmes d\'irrigation et pompes'
    }
  });

  const harvestCategory = await prisma.category.create({
    data: {
      name: 'Récolte',
      slug: 'recolte',
      description: 'Équipements de récolte et moisson'
    }
  });

  // Créer produits
  await prisma.product.create({
    data: {
      name: 'Tracteur John Deere 5082E',
      slug: 'tracteur-john-deere-5082e',
      description: 'Tracteur agricole John Deere 5082E de 82 CV',
      images: ['https://www.deere.africa/assets/images/5082E_01_13_3_MG_9614_F_large_large_c3d719aa0c9d0d5aef23a90c7ac659a821cf6d83.jpg'],
      price: 97000,
      brand: 'John Deere',
      model: '5082E',
      power: '82 CV',
      features: ['Transmission 16/16', 'Relevage 2800 kg'],
      stockQuantity: 3,
      isActive: true,
      isFeatured: true,
      categoryId: tractorsCategory.id
    }
  });

  await prisma.product.create({
    data: {
      name: 'Tracteur Massey Ferguson 240',
      slug: 'tracteur-massey-ferguson-240',
      description: 'Tracteur compact Massey Ferguson 240 de 50 CV',
      images: ['https://gwtractors.com.au/wp-content/uploads/2021/02/Massey-Ferguson-240-Australia-scaled.jpg'],
      price: 45000,
      brand: 'Massey Ferguson',
      model: '240',
      power: '50 CV',
      features: ['Transmission 8/2', 'Direction mecanique'],
      stockQuantity: 5,
      isActive: true,
      isFeatured: true,
      categoryId: tractorsCategory.id
    }
  });

  // Ajouter quelques outils agricoles
  await prisma.product.create({
    data: {
      name: 'Charrue réversible 3 corps',
      slug: 'charrue-reversible-3-corps',
      description: 'Charrue réversible professionnelle pour labour profond',
      images: ['https://example.com/charrue.jpg'],
      price: 8500,
      brand: 'Kuhn',
      model: 'Multi-Master 123',
      features: ['3 corps', 'Réversible', 'Hydraulique'],
      stockQuantity: 8,
      isActive: true,
      isFeatured: false,
      categoryId: toolsCategory.id
    }
  });

  await prisma.product.create({
    data: {
      name: 'Système d\'irrigation goutte à goutte',
      slug: 'irrigation-goutte-a-goutte',
      description: 'Kit complet d\'irrigation goutte à goutte pour 1 hectare',
      images: ['https://example.com/irrigation.jpg'],
      price: 2800,
      brand: 'Netafim',
      model: 'DripNet PC',
      features: ['1 hectare', 'Économie d\'eau', 'Installation facile'],
      stockQuantity: 12,
      isActive: true,
      isFeatured: true,
      categoryId: irrigationCategory.id
    }
  });

  await prisma.product.create({
    data: {
      name: 'Moissonneuse-batteuse',
      slug: 'moissonneuse-batteuse',
      description: 'Moissonneuse-batteuse compacte pour céréales',
      images: ['https://example.com/moissonneuse.jpg'],
      price: 185000,
      brand: 'New Holland',
      model: 'TC5.80',
      power: '156 CV',
      features: ['Largeur 4.5m', 'Trémie 4200L', 'Climatisation'],
      stockQuantity: 1,
      isActive: true,
      isFeatured: true,
      categoryId: harvestCategory.id
    }
  });

  await prisma.product.create({
    data: {
      name: 'Pulvérisateur traîné',
      slug: 'pulverisateur-traine',
      description: 'Pulvérisateur traîné pour traitement phytosanitaire',
      images: ['https://example.com/pulverisateur.jpg'],
      price: 15600,
      brand: 'Amazone',
      model: 'UX 3200',
      features: ['Cuve 3200L', 'Rampe 21m', 'GPS ready'],
      stockQuantity: 3,
      isActive: true,
      isFeatured: false,
      categoryId: toolsCategory.id
    }
  });

  // Utilisateur admin
  const adminPassword = await bcryptjs.hash('admin123', 12);
  await prisma.user.create({
    data: {
      email: 'admin@mdagricole.tn',
      password: adminPassword,
      name: 'Administrateur MD Agricole',
      phone: '+216 71 000 000',
      address: 'Siège Social MD Agricole',
      city: 'Tunis',
      role: 'ADMIN',
      isActive: true
    }
  });

  // Utilisateur test client
  const customerPassword = await bcryptjs.hash('johndoe123', 12);
  await prisma.user.create({
    data: {
      email: 'john@doe.com',
      password: customerPassword,
      name: 'John Doe',
      phone: '+216 71 123 456',
      address: 'Zone Industrielle Ariana',
      city: 'Tunis',
      role: 'CUSTOMER',
      isActive: true
    }
  });

  // Créer quelques commandes de test
  const customer = await prisma.user.findUnique({
    where: { email: 'john@doe.com' }
  });

  if (customer) {
    // Commande 1
    const order1 = await prisma.order.create({
      data: {
        orderNumber: 'CMD-001',
        status: 'PENDING',
        totalAmount: 2500.00,
        notes: 'Commande urgente pour la saison',
        customerName: customer.name || 'John Doe',
        customerEmail: customer.email,
        customerPhone: customer.phone || '+216 71 123 456',
        deliveryAddress: 'Zone Industrielle Ariana',
        deliveryCity: 'Tunis',
        deliveryPostalCode: '2080',
        userId: customer.id,
        orderItems: {
          create: [
            {
              quantity: 1,
              unitPrice: 2500.00,
              productId: (await prisma.product.findFirst())?.id || ''
            }
          ]
        }
      }
    });

    // Commande 2
    const order2 = await prisma.order.create({
      data: {
        orderNumber: 'CMD-002',
        status: 'CONFIRMED',
        totalAmount: 1800.00,
        notes: 'Livraison standard',
        customerName: customer.name || 'John Doe',
        customerEmail: customer.email,
        customerPhone: customer.phone || '+216 71 123 456',
        deliveryAddress: 'Avenue Habib Bourguiba',
        deliveryCity: 'Sfax',
        deliveryPostalCode: '3000',
        userId: customer.id,
        orderItems: {
          create: [
            {
              quantity: 2,
              unitPrice: 900.00,
              productId: (await prisma.product.findFirst())?.id || ''
            }
          ]
        }
      }
    });

    console.log('📦 Commandes de test créées');
  }

  console.log('Seeding terminé avec succès!');
  console.log('🔐 Comptes créés:');
  console.log('👨‍💼 Admin: admin@mdagricole.tn / admin123');
  console.log('👤 Client: john@doe.com / johndoe123');
  console.log('📊 Dashboard admin disponible sur: /admin');
}

main().catch(console.error).finally(() => prisma.$disconnect());

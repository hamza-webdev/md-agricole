import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function postDeploy() {
  console.log('🚀 Début du script post-déploiement...');

  try {
    // 1. Créer les index de performance
    console.log('📊 Création des index de performance...');
    await prisma.$executeRaw`SELECT create_performance_indexes();`;

    // 2. Créer les vues utiles
    console.log('👁️ Création des vues utiles...');
    await prisma.$executeRaw`SELECT create_useful_views();`;

    // 3. Vérifier que l'admin existe
    console.log('👤 Vérification de l\'utilisateur admin...');
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (!adminUser) {
      console.log('➕ Création de l\'utilisateur admin...');
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      await prisma.user.create({
        data: {
          email: 'admin@mdagricole.tn',
          password: hashedPassword,
          name: 'Administrateur',
          firstName: 'Admin',
          lastName: 'MD Agricole',
          role: 'ADMIN',
          isActive: true,
        }
      });
      
      console.log('✅ Utilisateur admin créé : admin@mdagricole.tn / admin123');
    } else {
      console.log('✅ Utilisateur admin existe déjà');
    }

    // 4. Vérifier les catégories
    console.log('📂 Vérification des catégories...');
    const categoryCount = await prisma.category.count();
    
    if (categoryCount === 0) {
      console.log('➕ Création des catégories par défaut...');
      const defaultCategories = [
        { name: 'Tracteurs', description: 'Tracteurs agricoles de toutes tailles' },
        { name: 'Outils de labour', description: 'Charrues, herses, cultivateurs' },
        { name: 'Équipements de semis', description: 'Semoirs et équipements de plantation' },
        { name: 'Matériel de récolte', description: 'Moissonneuses et équipements de récolte' },
        { name: 'Irrigation', description: 'Systèmes d\'irrigation et pompes' },
        { name: 'Pièces détachées', description: 'Pièces de rechange et accessoires' }
      ];

      for (const category of defaultCategories) {
        await prisma.category.create({
          data: {
            name: category.name,
            description: category.description,
            slug: category.name.toLowerCase()
              .replace(/[àáâãäå]/g, 'a')
              .replace(/[èéêë]/g, 'e')
              .replace(/[ìíîï]/g, 'i')
              .replace(/[òóôõö]/g, 'o')
              .replace(/[ùúûü]/g, 'u')
              .replace(/[ç]/g, 'c')
              .replace(/[^a-z0-9]/g, '-')
              .replace(/-+/g, '-')
              .replace(/^-|-$/g, ''),
            isActive: true
          }
        });
      }
      
      console.log('✅ Catégories par défaut créées');
    } else {
      console.log(`✅ ${categoryCount} catégories trouvées`);
    }

    // 5. Statistiques finales
    console.log('\n📊 Statistiques de la base de données :');
    const stats = await prisma.$queryRaw`SELECT * FROM dashboard_stats;` as any[];
    
    if (stats.length > 0) {
      const stat = stats[0];
      console.log(`👥 Clients actifs: ${stat.active_customers}`);
      console.log(`📦 Produits actifs: ${stat.active_products}`);
      console.log(`🛒 Total commandes: ${stat.total_orders}`);
      console.log(`🧾 Factures payées: ${stat.paid_invoices}`);
      console.log(`💰 Chiffre d'affaires: ${stat.total_revenue} TND`);
    }

    console.log('\n✅ Script post-déploiement terminé avec succès !');
    console.log('\n🌐 Votre application est prête :');
    console.log('   - Site web : https://mdagricole.zidani.org');
    console.log('   - Admin : https://mdagricole.zidani.org/admin');
    console.log('   - Login admin : admin@mdagricole.tn / admin123');

  } catch (error) {
    console.error('❌ Erreur lors du script post-déploiement:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  postDeploy()
    .then(() => {
      console.log('🎉 Post-déploiement terminé');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erreur fatale:', error);
      process.exit(1);
    });
}

export default postDeploy;

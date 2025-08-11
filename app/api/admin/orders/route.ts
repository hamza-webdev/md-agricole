import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';
import { OrderStatus } from '@prisma/client';

// Schéma de validation pour une nouvelle commande
const createOrderSchema = z.object({
  userId: z.string().min(1, 'L\'utilisateur est requis'),
  customerName: z.string().min(1, 'Le nom du client est requis'),
  customerEmail: z.string().email('Email invalide'),
  customerPhone: z.string().optional(),
  deliveryAddress: z.string().min(1, 'L\'adresse de livraison est requise'),
  deliveryCity: z.string().min(1, 'La ville de livraison est requise'),
  deliveryPostalCode: z.string().optional(),
  notes: z.string().optional(),
  orderItems: z.array(z.object({
    productId: z.string().min(1, 'L\'ID du produit est requis'),
    quantity: z.number().min(1, 'La quantité doit être positive'),
    unitPrice: z.number().min(0, 'Le prix unitaire doit être positif')
  })).min(1, 'Au moins un produit est requis'),
  totalAmount: z.number().min(0, 'Le montant total doit être positif')
});

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification et le rôle admin
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Vérifier si on veut seulement les commandes sans facture
    const { searchParams } = new URL(request.url);
    const withoutInvoice = searchParams.get('withoutInvoice') === 'true';

    const whereClause = withoutInvoice ? {
      invoice: null,
      status: {
        in: [
          OrderStatus.PENDING,
          OrderStatus.CONFIRMED,
          OrderStatus.PROCESSING,
          OrderStatus.SHIPPED,
          OrderStatus.DELIVERED
        ]
      }
    } : {};

    const orders = await db.order.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            firstName: true,
            lastName: true
          }
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                category: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        },
        invoice: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(orders);

  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Début de la création de commande');
    
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
    
    const validatedData = createOrderSchema.parse(body);
    console.log('✅ Données validées:', validatedData);

    // Vérifier que l'utilisateur existe
    const user = await db.user.findUnique({
      where: { id: validatedData.userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier la disponibilité des produits et calculer le total
    let calculatedTotal = 0;
    const productChecks: any[] = [];

    for (const item of validatedData.orderItems) {
      const product = await db.product.findUnique({
        where: { id: item.productId }
      });

      if (!product) {
        return NextResponse.json(
          { error: `Produit non trouvé: ${item.productId}` },
          { status: 404 }
        );
      }

      if (!product.isActive) {
        return NextResponse.json(
          { error: `Le produit "${product.name}" n'est pas actif` },
          { status: 400 }
        );
      }

      if (product.stockQuantity < item.quantity) {
        return NextResponse.json(
          { error: `Stock insuffisant pour "${product.name}". Stock disponible: ${product.stockQuantity}` },
          { status: 400 }
        );
      }

      calculatedTotal += item.quantity * item.unitPrice;
      productChecks.push({ product, item });
    }

    // Vérifier que le total calculé correspond
    if (Math.abs(calculatedTotal - validatedData.totalAmount) > 0.01) {
      return NextResponse.json(
        { error: 'Le montant total ne correspond pas au calcul' },
        { status: 400 }
      );
    }

    // Générer un numéro de commande unique
    const orderCount = await db.order.count();
    const orderNumber = `CMD-${String(orderCount + 1).padStart(6, '0')}`;

    // Créer la commande avec les articles dans une transaction
    const order = await db.$transaction(async (prisma) => {
      // Créer la commande
      const newOrder = await prisma.order.create({
        data: {
          orderNumber,
          status: 'CONFIRMED', // Commande admin directement confirmée
          totalAmount: validatedData.totalAmount,
          notes: validatedData.notes,
          customerName: validatedData.customerName,
          customerEmail: validatedData.customerEmail,
          customerPhone: validatedData.customerPhone || '',
          deliveryAddress: validatedData.deliveryAddress,
          deliveryCity: validatedData.deliveryCity,
          deliveryPostalCode: validatedData.deliveryPostalCode || '',
          userId: validatedData.userId,
        },
        include: {
          user: true
        }
      });

      // Créer les articles de commande et mettre à jour le stock
      for (const { product, item } of productChecks) {
        await prisma.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          }
        });

        // Décrémenter le stock
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: {
              decrement: item.quantity
            }
          }
        });
      }

      return newOrder;
    });

    console.log('✅ Commande créée:', order.orderNumber);

    return NextResponse.json({
      success: true,
      message: 'Commande créée avec succès',
      order: {
        ...order,
        orderItems: validatedData.orderItems
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors de la création de la commande:', error);

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

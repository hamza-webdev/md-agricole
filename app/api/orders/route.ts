
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const {
      customerName,
      customerEmail,
      customerPhone,
      deliveryAddress,
      deliveryCity,
      deliveryPostalCode,
      notes,
      items,
      totalAmount
    } = await request.json();

    // Générer un numéro de commande unique
    const orderNumber = `MD${Date.now().toString().slice(-8)}`;

    // Créer la commande
    const order = await db.order.create({
      data: {
        orderNumber,
        status: 'PENDING',
        totalAmount,
        customerName,
        customerEmail,
        customerPhone,
        deliveryAddress,
        deliveryCity,
        deliveryPostalCode,
        notes,
        userId: session.user.id,
        orderItems: {
          create: items?.map((item: any) => ({
            productId: item.id,
            quantity: item.quantity,
            unitPrice: item.price,
          }))
        }
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Commande créée avec succès',
      orderId: order.id,
      orderNumber: order.orderNumber
    }, { status: 201 });

  } catch (error) {
    console.error('Erreur lors de la création de la commande:', error);
    return NextResponse.json(
      { message: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

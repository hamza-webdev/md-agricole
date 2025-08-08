import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Test API - Récupération des commandes sans facture...');

    // Récupérer toutes les commandes
    const allOrders = await db.order.findMany({
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

    console.log(`📦 Total commandes: ${allOrders.length}`);

    // Récupérer les commandes sans facture
    const ordersWithoutInvoice = await db.order.findMany({
      where: {
        invoice: null,
        status: {
          in: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED']
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

    console.log(`📦 Commandes sans facture: ${ordersWithoutInvoice.length}`);

    return NextResponse.json({
      success: true,
      totalOrders: allOrders.length,
      ordersWithoutInvoice: ordersWithoutInvoice.length,
      allOrders: allOrders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        customerName: order.customerName,
        totalAmount: order.totalAmount,
        hasInvoice: !!order.invoice,
        invoiceNumber: order.invoice?.invoiceNumber || null
      })),
      ordersWithoutInvoice: ordersWithoutInvoice.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
        user: order.user
      }))
    });

  } catch (error) {
    console.error('❌ Erreur dans test API:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}

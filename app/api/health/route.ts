import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Test de connectivité à la base de données
    await db.$queryRaw`SELECT 1`;
    
    // Statistiques rapides
    const stats = await Promise.all([
      db.user.count(),
      db.product.count(),
      db.order.count(),
      db.invoice.count()
    ]);

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      version: '1.0.0',
      environment: process.env.NODE_ENV,
      stats: {
        users: stats[0],
        products: stats[1],
        orders: stats[2],
        invoices: stats[3]
      }
    });

  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 503 });
  }
}

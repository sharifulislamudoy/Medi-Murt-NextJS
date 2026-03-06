import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { cutoff } = await req.json();
    if (!cutoff) {
      return NextResponse.json({ error: 'Cutoff time required' }, { status: 400 });
    }

    const cutoffDate = new Date(cutoff);

    const result = await prisma.order.updateMany({
      where: {
        status: 'PENDING',
        orderDate: { lte: cutoffDate },
      },
      data: { status: 'PROCESSING' },
    });

    return NextResponse.json({
      message: 'Orders processed',
      count: result.count,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
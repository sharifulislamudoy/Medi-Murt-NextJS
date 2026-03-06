import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET single order (already used in view modal)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true,
                sku: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT – Update order items (edit)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { items } = await req.json(); // items: [{ productId, quantity }]

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Invalid items data' }, { status: 400 });
    }

    // Fetch current order with items
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // We'll do a transaction to replace items and update stock accordingly
    await prisma.$transaction(async (tx) => {
      // Get existing items
      const existingItems = order.items;

      // Calculate stock adjustments:
      // For each existing item, we need to add back its quantity (since we'll remove them)
      for (const existing of existingItems) {
        await tx.stock.update({
          where: { productId: existing.productId },
          data: { quantity: { increment: existing.quantity } },
        });
      }

      // Delete all existing order items
      await tx.orderItem.deleteMany({ where: { orderId: id } });

      // Now create new items and decrement stock
      let newTotal = 0;
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { sellPrice: true },
        });
        if (!product) throw new Error(`Product ${item.productId} not found`);

        newTotal += product.sellPrice * item.quantity;

        // Decrement stock
        await tx.stock.update({
          where: { productId: item.productId },
          data: { quantity: { decrement: item.quantity } },
        });

        // Create order item
        await tx.orderItem.create({
          data: {
            orderId: id,
            productId: item.productId,
            quantity: item.quantity,
            price: product.sellPrice,
          },
        });
      }

      // Update order total
      await tx.order.update({
        where: { id },
        data: { totalAmount: newTotal },
      });
    });

    return NextResponse.json({ message: 'Order updated successfully' });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH – Update status and/or payment status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { status, paymentStatus } = await req.json();

    const updateData: any = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    await prisma.order.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ message: 'Order status updated' });
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
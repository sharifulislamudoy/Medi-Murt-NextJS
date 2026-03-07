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

    // Use a transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // 1. Find all PENDING orders placed before cutoff
      const pendingOrders = await tx.order.findMany({
        where: {
          status: 'PENDING',
          orderDate: { lte: cutoffDate },
        },
        select: { id: true },
      });

      const pendingIds = pendingOrders.map(o => o.id);

      // 2. Update them to PROCESSING
      if (pendingIds.length > 0) {
        await tx.order.updateMany({
          where: { id: { in: pendingIds } },
          data: { status: 'PROCESSING' },
        });
      }

      // 3. Fetch all PROCESSING orders (including those just updated)
      const processingOrders = await tx.order.findMany({
        where: { status: 'PROCESSING' },
        include: {
          items: {
            include: {
              product: {
                select: { id: true, name: true }, // only needed for logging, not critical
              },
            },
          },
        },
      });

      // 4. Merge orders per customer (by phone)
      const mergedCount = await mergeProcessingOrders(tx, processingOrders);

      return {
        updatedCount: pendingIds.length,
        mergedCount,
      };
    });

    return NextResponse.json({
      message: 'Orders processed and merged',
      count: result.updatedCount,
      merged: result.mergedCount,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

/**
 * Merges multiple PROCESSING orders for the same customer into one.
 * Only merges orders where all orders in the group have paymentStatus = 'DUE'.
 * The order with the highest totalAmount becomes the target; others are merged into it and then deleted.
 */
async function mergeProcessingOrders(tx: any, orders: any[]) {
  // Group by customerPhone (primary identifier)
  const groups = new Map<string, any[]>();
  for (const order of orders) {
    const key = order.customerPhone; // using phone as unique customer key
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(order);
  }

  let mergedCount = 0;

  for (const [phone, group] of groups.entries()) {
    if (group.length <= 1) continue; // no merge needed

    // Skip merging if any order in the group has paymentStatus = 'PAID'
    if (group.some((o) => o.paymentStatus === 'PAID')) {
      console.log(`Skipping merge for phone ${phone} because at least one order is PAID`);
      continue;
    }

    // Choose target order: highest totalAmount (tie → earliest createdAt)
    const target = group.reduce((best, current) => {
      if (current.totalAmount > best.totalAmount) return current;
      if (current.totalAmount === best.totalAmount && current.createdAt < best.createdAt) return current;
      return best;
    });

    const sources = group.filter((o) => o.id !== target.id);

    for (const source of sources) {
      // Transfer each item from source to target
      for (const sourceItem of source.items) {
        // Look for existing item in target with same productId AND same price
        const existingItem = target.items.find(
          (item: any) => item.productId === sourceItem.productId && item.price === sourceItem.price
        );

        if (existingItem) {
          // Merge quantities
          await tx.orderItem.update({
            where: { id: existingItem.id },
            data: {
              quantity: existingItem.quantity + sourceItem.quantity,
            },
          });
          // Update target totalAmount incrementally
          await tx.order.update({
            where: { id: target.id },
            data: {
              totalAmount: { increment: sourceItem.price * sourceItem.quantity },
            },
          });
        } else {
          // Create new item in target order
          await tx.orderItem.create({
            data: {
              orderId: target.id,
              productId: sourceItem.productId,
              quantity: sourceItem.quantity,
              price: sourceItem.price,
            },
          });
          // Update target totalAmount
          await tx.order.update({
            where: { id: target.id },
            data: {
              totalAmount: { increment: sourceItem.price * sourceItem.quantity },
            },
          });
          // Also add this new item to target.items array for subsequent iterations
          target.items.push({
            id: 'temp', // not needed for further logic, but we can ignore
            productId: sourceItem.productId,
            price: sourceItem.price,
            quantity: sourceItem.quantity,
          });
        }
      }

      // Delete the source order (cascade will remove its items)
      await tx.order.delete({
        where: { id: source.id },
      });

      mergedCount++;
    }
  }

  return mergedCount;
}
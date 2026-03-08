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

    // Increase transaction timeout to 20 seconds
    const result = await prisma.$transaction(
      async (tx) => {
        // 1. Find all PENDING orders placed before cutoff
        const pendingOrders = await tx.order.findMany({
          where: {
            status: 'PENDING',
            orderDate: { lte: cutoffDate },
          },
          select: { id: true },
        });

        const pendingIds = pendingOrders.map((o) => o.id);

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
                  select: { id: true, name: true }, // only for logging
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
      },
      { timeout: 20000 } // 20 seconds
    );

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
 * Optimised merge: uses a Map for fast item lookups, batches total amount updates,
 * and deletes source orders in bulk.
 */
async function mergeProcessingOrders(tx: any, orders: any[]) {
  // Group by customerPhone
  const groups = new Map<string, any[]>();
  for (const order of orders) {
    const key = order.customerPhone;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(order);
  }

  let mergedCount = 0;

  for (const [phone, group] of groups.entries()) {
    if (group.length <= 1) continue;

    // Skip if any order in the group has paymentStatus = 'PAID'
    if (group.some((o) => o.paymentStatus === 'PAID')) {
      console.log(`Skipping merge for phone ${phone} because at least one order is PAID`);
      continue;
    }

    // Choose target order: highest totalAmount (tie → earliest createdAt)
    const target = group.reduce((best, current) => {
      if (current.totalAmount > best.totalAmount) return current;
      if (current.totalAmount === best.totalAmount && current.createdAt < best.createdAt)
        return current;
      return best;
    });

    const sources = group.filter((o) => o.id !== target.id);
    const sourceIdsToDelete: string[] = [];

    // Build a quick‑lookup map for target items: key = `${productId}:${price}`
    const targetItemMap = new Map<string, any>();
    for (const item of target.items) {
      const key = `${item.productId}:${item.price}`;
      targetItemMap.set(key, item);
    }

    for (const source of sources) {
      let totalAmountToAdd = 0;

      for (const sourceItem of source.items) {
        const key = `${sourceItem.productId}:${sourceItem.price}`;
        const existingItem = targetItemMap.get(key);

        if (existingItem) {
          // Update existing item
          const newQuantity = existingItem.quantity + sourceItem.quantity;
          await tx.orderItem.update({
            where: { id: existingItem.id },
            data: { quantity: newQuantity },
          });
          // Update the map and in‑memory item for subsequent sources
          existingItem.quantity = newQuantity;
        } else {
          // Create new item in target order
          const newItem = await tx.orderItem.create({
            data: {
              orderId: target.id,
              productId: sourceItem.productId,
              quantity: sourceItem.quantity,
              price: sourceItem.price,
            },
          });
          // Add to map and to target.items array
          target.items.push({
            id: newItem.id,
            productId: sourceItem.productId,
            price: sourceItem.price,
            quantity: sourceItem.quantity,
          });
          targetItemMap.set(key, {
            id: newItem.id,
            productId: sourceItem.productId,
            price: sourceItem.price,
            quantity: sourceItem.quantity,
          });
        }

        // Accumulate the total amount contributed by this source item
        totalAmountToAdd += sourceItem.price * sourceItem.quantity;
      }

      // Update target order total amount once per source order
      if (totalAmountToAdd > 0) {
        await tx.order.update({
          where: { id: target.id },
          data: { totalAmount: { increment: totalAmountToAdd } },
        });
      }

      // Mark source for deletion
      sourceIdsToDelete.push(source.id);
    }

    // Delete all source orders in one query
    if (sourceIdsToDelete.length > 0) {
      await tx.order.deleteMany({
        where: { id: { in: sourceIdsToDelete } },
      });
      mergedCount += sourceIdsToDelete.length;
    }
  }

  return mergedCount;
}
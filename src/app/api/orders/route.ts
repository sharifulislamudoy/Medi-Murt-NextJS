import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { items, totalPrice } = await req.json(); // items: { id, quantity }[]

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 });
    }

    // Fetch user details including area and delivery code
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        shopName: true,
        address: true,
        phone: true,
        area: {
          include: { deliveryCode: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch products with stock (optional, we'll handle stock via upsert)
    const productIds = items.map(i => i.id);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(products.map(p => [p.id, p]));

    // Validate products and calculate total
    let calculatedTotal = 0;
    const orderItemsData = items.map(item => {
      const product = productMap.get(item.id);
      if (!product) {
        throw new Error(`Product ${item.id} not found`);
      }
      if (!product.status || !product.availability) {
        throw new Error(`Product ${product.name} is not available`);
      }
      const price = product.sellPrice;
      calculatedTotal += price * item.quantity;
      return {
        productId: item.id,
        quantity: item.quantity,
        price,
      };
    });

    if (Math.abs(calculatedTotal - totalPrice) > 0.01) {
      return NextResponse.json({ error: 'Total price mismatch' }, { status: 400 });
    }

    // Generate invoice number
    const lastOrder = await prisma.order.findFirst({
      orderBy: { invoiceNo: 'desc' },
      select: { invoiceNo: true },
    });
    let nextInvoiceNumber = 1;
    if (lastOrder) {
      const lastNum = parseInt(lastOrder.invoiceNo, 10);
      if (!isNaN(lastNum)) {
        nextInvoiceNumber = lastNum + 1;
      }
    }
    const invoiceNo = nextInvoiceNumber.toString().padStart(4, '0');

    // Compute delivery date (unchanged)
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    let deliveryDate: Date;
    if (currentHour > 11 || (currentHour === 11 && currentMinute > 0)) {
      deliveryDate = new Date(now);
      deliveryDate.setDate(now.getDate() + 1);
    } else {
      deliveryDate = new Date(now);
    }
    deliveryDate.setHours(23, 59, 59, 999);

    const deliveryCodeId = user.area?.deliveryCode?.id || null;

    // Create order and items, update stock using upsert
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          invoiceNo,
          customerName: user.name,
          customerShopName: user.shopName,
          customerAddress: user.address,
          customerPhone: user.phone,
          deliveryDate,
          totalAmount: calculatedTotal,
          userId: session.user.id,
          deliveryCodeId,
          items: {
            create: orderItemsData,
          },
        },
      });

      // Update stock – create if missing, then decrement
      for (const item of items) {
        await tx.stock.upsert({
          where: { productId: item.id },
          update: {
            quantity: { decrement: item.quantity },
          },
          create: {
            productId: item.id,
            quantity: -item.quantity, // initial stock is 0, so after order it's negative
          },
        });
      }

      return newOrder;
    });

    return NextResponse.json(
      {
        orderId: order.id,
        invoiceNo: order.invoiceNo,
        trCode: user.area?.trCode || null,
        deliveryCode: user.area?.deliveryCode?.code || null,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Order creation error:', error);

    // Return more specific error messages if possible
    if (error.message?.startsWith('Product')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Stock record not found for one or more products' },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
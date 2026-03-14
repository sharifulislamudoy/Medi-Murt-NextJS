import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "DELIVERY_BOY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get delivery boy's assigned delivery code
    const deliveryBoy = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { deliveryCodeId: true },
    });

    if (!deliveryBoy?.deliveryCodeId) {
      return NextResponse.json(
        { error: "You are not assigned to any delivery code" },
        { status: 403 }
      );
    }

    // Fetch the order to ensure it belongs to this delivery boy and is SHIPPED
    const order = await prisma.order.findUnique({
      where: { id },
      select: { deliveryCodeId: true, status: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.deliveryCodeId !== deliveryBoy.deliveryCodeId) {
      return NextResponse.json(
        { error: "This order is not assigned to you" },
        { status: 403 }
      );
    }

    if (order.status !== "SHIPPED") {
      return NextResponse.json(
        { error: "Only SHIPPED orders can be marked as delivered" },
        { status: 400 }
      );
    }

    // Update status to DELIVERED and payment to PAID (if not already)
    await prisma.order.update({
      where: { id },
      data: {
        status: "DELIVERED",
        paymentStatus: "PAID", // optional: mark as paid on delivery
      },
    });

    return NextResponse.json({ message: "Order marked as delivered" });
  } catch (error) {
    console.error("Error marking order delivered:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
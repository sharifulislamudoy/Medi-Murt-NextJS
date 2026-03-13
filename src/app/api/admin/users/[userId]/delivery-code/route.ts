import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type Params = Promise<{ userId: string }>;

export async function PUT(req: Request, context: { params: Params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = await context.params;
  const { deliveryCodeId } = await req.json();

  if (!deliveryCodeId) {
    return NextResponse.json(
      { error: "deliveryCodeId is required" },
      { status: 400 }
    );
  }

  try {
    // Verify user exists and is a delivery boy
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user || user.role !== "DELIVERY_BOY") {
      return NextResponse.json(
        { error: "User not found or not a delivery boy" },
        { status: 404 }
      );
    }

    // Verify delivery code exists
    const code = await prisma.deliveryCode.findUnique({
      where: { id: deliveryCodeId },
    });
    if (!code) {
      return NextResponse.json(
        { error: "Delivery code not found" },
        { status: 404 }
      );
    }

    // Update the user
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { deliveryCodeId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update delivery code" },
      { status: 500 }
    );
  }
}
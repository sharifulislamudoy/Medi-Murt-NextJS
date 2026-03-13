import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId, newStatus, deliveryCodeId } = await req.json();

  if (!userId || !newStatus) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Allowed transitions are already enforced on frontend, but double-check
  const validStatuses = ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"];
  if (!validStatuses.includes(newStatus)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  try {
    // Fetch the user to check role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If approving a delivery boy, deliveryCodeId is required
    if (user.role === "DELIVERY_BOY" && newStatus === "APPROVED" && !deliveryCodeId) {
      return NextResponse.json(
        { error: "Delivery code is required when approving a delivery boy" },
        { status: 400 }
      );
    }

    // If deliveryCodeId is provided, verify it exists and is not already assigned
    // (optional: allow reassigning? We'll just check existence for now)
    if (deliveryCodeId) {
      const deliveryCode = await prisma.deliveryCode.findUnique({
        where: { id: deliveryCodeId },
      });
      if (!deliveryCode) {
        return NextResponse.json(
          { error: "Delivery code not found" },
          { status: 404 }
        );
      }
    }

    // Update user status and optionally assign delivery code
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        status: newStatus,
        ...(deliveryCodeId && { deliveryCodeId }),
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update user status" },
      { status: 500 }
    );
  }
}
// app/api/admin/update-status/route.ts

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// 📝 Define which transitions are allowed
// Key = current status, Value = array of statuses you can change TO
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["APPROVED", "REJECTED", "SUSPENDED"],
  APPROVED: ["REJECTED", "SUSPENDED"],
  REJECTED: ["APPROVED"],
  SUSPENDED: ["APPROVED"],
};

export async function POST(req: Request) {
  try {
    // 🔒 Only admin can change user status
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, newStatus } = await req.json();

    // ✅ Basic validation — make sure both fields are present
    if (!userId || !newStatus) {
      return NextResponse.json(
        { error: "userId and newStatus are required" },
        { status: 400 }
      );
    }

    // 🔍 Fetch the user's current status from DB
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { status: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 🚦 Check if this transition is allowed
    const allowedNext = ALLOWED_TRANSITIONS[user.status] ?? [];
    if (!allowedNext.includes(newStatus)) {
      return NextResponse.json(
        {
          error: `Cannot change status from ${user.status} to ${newStatus}`,
        },
        { status: 400 }
      );
    }

    // 💾 Update the user status in the database
    await prisma.user.update({
      where: { id: userId },
      data: { status: newStatus },
    });

    return NextResponse.json({
      message: `User status updated to ${newStatus}`,
    });
  } catch (error) {
    console.error("Status update error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const procurements = await prisma.procurement.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                sku: true,
                image: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ procurements });
  } catch (error) {
    console.error("Error fetching procurements:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const ads = await prisma.advertisement.findMany({
    where: { isVisible: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(ads);
}
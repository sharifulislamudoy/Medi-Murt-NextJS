// app/api/admin/products/[id]/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await req.json();
  const {
    name,
    category,
    mrp,
    genericName,
    brandName,
    image,
    description,
    sellPrice,
    costPrice,
    stock,
    status,          // add
    availability,    // add
  } = body;

  // Handle generic upsert
  let genericId = undefined;
  if (genericName !== undefined) {
    if (genericName) {
      const generic = await prisma.generic.upsert({
        where: { name: genericName },
        update: {},
        create: { name: genericName },
      });
      genericId = generic.id;
    } else {
      genericId = null;
    }
  }

  // Handle brand upsert
  let brandId = undefined;
  if (brandName !== undefined) {
    if (brandName) {
      const brand = await prisma.brand.upsert({
        where: { name: brandName },
        update: {},
        create: { name: brandName },
      });
      brandId = brand.id;
    } else {
      brandId = null;
    }
  }

  const updated = await prisma.product.update({
    where: { id },
    data: {
      name,
      category,
      mrp: mrp ? parseFloat(mrp) : undefined,
      genericId,
      brandId,
      image,
      description,
      sellPrice: sellPrice ? parseFloat(sellPrice) : undefined,
      costPrice: costPrice ? parseFloat(costPrice) : undefined,
      stock: stock !== undefined ? parseInt(stock, 10) : undefined,
      status: status !== undefined ? status : undefined,  // add
      availability: availability !== undefined ? availability : undefined, // add
    },
    include: {
      generic: true,
      brand: true,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  await prisma.product.delete({
    where: { id },
  });

  return NextResponse.json({ message: "Deleted" });
}
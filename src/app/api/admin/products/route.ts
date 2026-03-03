import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateNextSKU } from "@/lib/sku";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const products = await prisma.product.findMany({
    include: {
      generic: true,
      brand: true,
      stock: true,   // include stock
    },
    orderBy: { createdAt: "desc" },
  });

  // Flatten stock for admin table (optional, but we keep stock.quantity for editing)
  const mapped = products.map(p => ({
    ...p,
    stock: p.stock?.quantity ?? 0,
  }));

  return NextResponse.json(mapped);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
    stock,           // this is the initial quantity
  } = await req.json();

  if (!name || !category || !mrp || !image || !description || !sellPrice || !costPrice || stock === undefined) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const sku = await generateNextSKU();

  let genericId = null;
  if (genericName) {
    const generic = await prisma.generic.upsert({
      where: { name: genericName },
      update: {},
      create: { name: genericName },
    });
    genericId = generic.id;
  }

  let brandId = null;
  if (brandName) {
    const brand = await prisma.brand.upsert({
      where: { name: brandName },
      update: {},
      create: { name: brandName },
    });
    brandId = brand.id;
  }

  // Use transaction to create product and its stock record
  const product = await prisma.$transaction(async (tx) => {
    const newProduct = await tx.product.create({
      data: {
        name,
        category,
        sku,
        mrp: parseFloat(mrp),
        genericId,
        brandId,
        image,
        description,
        sellPrice: parseFloat(sellPrice),
        costPrice: parseFloat(costPrice),
      },
      include: { generic: true, brand: true },
    });

    await tx.stock.create({
      data: {
        productId: newProduct.id,
        quantity: parseInt(stock, 10),
      },
    });

    return newProduct;
  });

  // Return with stock field for consistency
  return NextResponse.json({ ...product, stock: parseInt(stock, 10) });
}
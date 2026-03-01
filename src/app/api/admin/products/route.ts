// app/api/admin/products/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateNextSKU } from "@/lib/sku";

// GET all products (Admin only)
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const products = await prisma.product.findMany({
    include: {
      generic: true,
      brand: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products);
}

// CREATE product
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    name,
    category,
    mrp,
    genericName,   // string (optional)
    brandName,     // string (optional)
    image,
    description,
    sellPrice,
    costPrice,
    stock,
  } = await req.json();

  // Validate required fields
  if (!name || !category || !mrp || !image || !description || !sellPrice || !costPrice || stock === undefined) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Generate SKU
  const sku = await generateNextSKU();

  // Handle generic: find or create
  let genericId = null;
  if (genericName) {
    const generic = await prisma.generic.upsert({
      where: { name: genericName },
      update: {},
      create: { name: genericName },
    });
    genericId = generic.id;
  }

  // Handle brand: find or create
  let brandId = null;
  if (brandName) {
    const brand = await prisma.brand.upsert({
      where: { name: brandName },
      update: {},
      create: { name: brandName },
    });
    brandId = brand.id;
  }

  const product = await prisma.product.create({
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
      stock: parseInt(stock, 10),
    },
    include: {
      generic: true,
      brand: true,
    },
  });

  return NextResponse.json(product);
}
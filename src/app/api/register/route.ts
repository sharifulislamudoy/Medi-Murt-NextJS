import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const hashedPassword = await bcrypt.hash(body.password, 10);

    await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        password: hashedPassword,
        address: body.address,
        shopName: body.shopName,
        role: body.role,
        status: "PENDING", // Default pending
      },
    });

    return NextResponse.json({ message: "User registered" });

  } catch (error) {
    return NextResponse.json(
      { error: "User already exists" },
      { status: 400 }
    );
  }
}
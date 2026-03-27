import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const {
      name,
      email,
      phone,
      password,
      address,
      shopName,
      bankAccountNumber,
      bankBranch,
      accountHolderName,
    } = await req.json();

    // Basic validation
    if (!name || !email || !phone || !password || !address || !shopName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email or phone already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with role SUPPLIER
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        address,
        shopName,
        role: "SUPPLIER",
        status: "PENDING",
        bankAccountNumber: bankAccountNumber || null,
        bankBranch: bankBranch || null,
        accountHolderName: accountHolderName || null,
      },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      { message: "Supplier account created successfully", user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error("Supplier registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
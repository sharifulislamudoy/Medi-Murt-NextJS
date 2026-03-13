import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, phone, password, vehicle } = await req.json();

    // Basic validation
    if (!name || !email || !phone || !password || !vehicle) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate vehicle value
    if (!["BIKE", "CYCLE"].includes(vehicle)) {
      return NextResponse.json(
        { error: "Vehicle must be BIKE or CYCLE" },
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

    // Create user with role DELIVERY_BOY and status PENDING
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        address: "", // Delivery boys may not need address at registration
        role: "DELIVERY_BOY",
        status: "PENDING",
        vehicle,
      },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      { message: "Delivery boy account created successfully", user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error("Delivery boy registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
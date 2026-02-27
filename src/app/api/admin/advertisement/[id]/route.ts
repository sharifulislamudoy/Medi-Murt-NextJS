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

    const { id } = await context.params; // 👈 VERY IMPORTANT

    const body = await req.json();
    const { title, imageUrl, category, hyperlink, isVisible } = body;

    const updated = await prisma.advertisement.update({
        where: { id },
        data: {
            title,
            imageUrl,
            category,
            hyperlink,
            isVisible,
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

    const { id } = await context.params; // 👈 MUST

    await prisma.advertisement.delete({
        where: { id },
    });

    return NextResponse.json({ message: "Deleted" });
}
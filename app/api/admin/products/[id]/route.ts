import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { name, category, price, description, image, inStock } = body;
  const priceNum = price !== undefined ? Number(price) : undefined;
  if (priceNum !== undefined && (Number.isNaN(priceNum) || priceNum < 0)) {
    return NextResponse.json({ error: "Price must be a valid number." }, { status: 400 });
  }

  try {
    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined ? { name: name.trim() } : {}),
        ...(category !== undefined ? { category: category.trim().toLowerCase() } : {}),
        ...(priceNum !== undefined ? { price: priceNum } : {}),
        ...(description !== undefined ? { description: description?.trim() || null } : {}),
        ...(image !== undefined ? { image: image || null } : {}),
        ...(inStock !== undefined ? { inStock: !!inStock } : {})
      }
    });
    return NextResponse.json({ product });
  } catch {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.product.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }
}

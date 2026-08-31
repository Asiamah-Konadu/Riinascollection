import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
  const plain = products.map((p) => ({ ...p, price: Number(p.price) }));
  return NextResponse.json({ products: plain });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { name, category, price, description, image, inStock } = body;

  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Product name is required." }, { status: 400 });
  }
  if (!category || typeof category !== "string") {
    return NextResponse.json({ error: "Category is required." }, { status: 400 });
  }
  const priceNum = Number(price);
  if (Number.isNaN(priceNum) || priceNum < 0) {
    return NextResponse.json({ error: "Price must be a valid number." }, { status: 400 });
  }

  const product = await prisma.product.create({
    data: {
      name: name.trim(),
      category: category.trim().toLowerCase(),
      price: priceNum,
      description: description?.trim() || null,
      image: image || null,
      inStock: inStock !== false
    }
  });

  return NextResponse.json({ product }, { status: 201 });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { customerName, phone, note, items } = body as {
    customerName?: string;
    phone?: string;
    note?: string;
    items?: { productId: string; qty?: number }[];
  };

  if (!customerName || !customerName.trim()) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }
  if (!phone || !phone.trim()) {
    return NextResponse.json({ error: "Phone number is required." }, { status: 400 });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Add at least one item to order." }, { status: 400 });
  }

  const productIds = [...new Set(items.map((i) => i.productId))];
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });

  if (products.length !== productIds.length) {
    return NextResponse.json(
      { error: "One or more items are no longer available." },
      { status: 400 }
    );
  }

  let total = 0;
  const orderItemsData = items.map((i) => {
    const product = products.find((p) => p.id === i.productId)!;
    const qty = Math.max(1, Math.min(50, Number(i.qty) || 1));
    total += Number(product.price) * qty;
    return {
      productId: product.id,
      name: product.name,
      price: product.price,
      qty
    };
  });

  const order = await prisma.$transaction(async (tx) => {
    const count = await tx.order.count();
    const orderNumber = `CB-${String(count + 1).padStart(5, "0")}`;
    return tx.order.create({
      data: {
        orderNumber,
        customerName: customerName.trim(),
        phone: phone.trim(),
        note: note?.trim() || null,
        total,
        items: { create: orderItemsData }
      },
      include: { items: true }
    });
  });

  return NextResponse.json({ order }, { status: 201 });
}

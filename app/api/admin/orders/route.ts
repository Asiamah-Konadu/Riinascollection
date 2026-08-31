import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true }
  });
  const plain = orders.map((o) => ({
    ...o,
    total: Number(o.total),
    items: o.items.map((i) => ({ ...i, price: Number(i.price) }))
  }));
  return NextResponse.json({ orders: plain });
}

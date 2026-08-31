import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const VALID_STATUSES = ["pending", "confirmed", "fulfilled"];

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => null);
  const status = body?.status;

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  try {
    const order = await prisma.order.update({
      where: { id: params.id },
      data: { status },
      include: { items: true }
    });
    const plain = {
      ...order,
      total: Number(order.total),
      items: order.items.map((i) => ({ ...i, price: Number(i.price) }))
    };
    return NextResponse.json({ order: plain });
  } catch {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }
}

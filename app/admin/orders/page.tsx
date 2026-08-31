import { prisma } from "@/lib/prisma";
import OrderManager from "./OrderManager";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true }
  });

  const plain = orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: o.customerName,
    phone: o.phone,
    note: o.note,
    total: Number(o.total),
    status: o.status,
    createdAt: o.createdAt.toISOString(),
    items: o.items.map((i) => ({ id: i.id, name: i.name, price: Number(i.price), qty: i.qty }))
  }));

  return <OrderManager initialOrders={plain} />;
}

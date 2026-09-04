import { prisma } from "@/lib/prisma";
import DashboardLive from "./DashboardLive";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [productCount, pendingOrders, recentOrders] = await Promise.all([
    prisma.product.count(),
    prisma.order.count({ where: { status: "pending" } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { items: true }
    })
  ]);

  const plainRecentOrders = recentOrders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: o.customerName,
    phone: o.phone,
    note: o.note,
    total: Number(o.total),
    status: o.status,
    createdAt: o.createdAt.toISOString(),
    items: o.items.map((i) => ({
      id: i.id,
      name: i.name,
      price: Number(i.price),
      qty: i.qty
    }))
  }));

  return (
    <DashboardLive
      initialProductCount={productCount}
      initialPendingOrders={pendingOrders}
      initialRecentOrders={plainRecentOrders}
    />
  );
}

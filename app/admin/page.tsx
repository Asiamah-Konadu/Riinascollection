import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [productCount, pendingOrders, recentOrders] = await Promise.all([
    prisma.product.count(),
    prisma.order.count({ where: { status: "pending" } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { items: true } })
  ]);

  return (
    <>
      <div className="form-row" style={{ marginBottom: 24 }}>
        <div className="admin-card">
          <div style={{ fontSize: "0.8rem", color: "#6b6b63" }}>Products</div>
          <div style={{ fontFamily: "'Fraunces',serif", fontSize: "2rem" }}>{productCount}</div>
          <Link href="/admin/products" className="link-btn">
            Manage products →
          </Link>
        </div>
        <div className="admin-card">
          <div style={{ fontSize: "0.8rem", color: "#6b6b63" }}>Pending orders</div>
          <div style={{ fontFamily: "'Fraunces',serif", fontSize: "2rem" }}>{pendingOrders}</div>
          <Link href="/admin/orders" className="link-btn">
            View orders →
          </Link>
        </div>
      </div>

      <div className="admin-card">
        <h2>Recent orders</h2>
        {recentOrders.length === 0 ? (
          <p className="empty-state">No orders yet.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.id}>
                  <td>
                    <Link href={`/receipt/${o.id}`} target="_blank" className="link-btn">
                      {o.orderNumber}
                    </Link>
                  </td>
                  <td>{o.customerName}</td>
                  <td>{o.items.map((i) => `${i.name} x${i.qty}`).join(", ")}</td>
                  <td>GHS {Number(o.total).toFixed(2)}</td>
                  <td>
                    <span className={`badge ${o.status}`}>{o.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

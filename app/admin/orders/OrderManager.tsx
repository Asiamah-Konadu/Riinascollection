"use client";

import { useState } from "react";
import Link from "next/link";

type OrderItem = { id: string; name: string; price: number; qty: number };
type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  note: string | null;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
};

const STATUSES = ["pending", "confirmed", "fulfilled"];

export default function OrderManager({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [filter, setFilter] = useState("all");

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    } else {
      alert("Could not update order status.");
    }
  }

  const visible = orders.filter((o) => filter === "all" || o.status === filter);

  return (
    <div className="admin-card">
      <div className="toolbar">
        <h2 style={{ marginBottom: 0 }}>Orders</h2>
        <div className="field" style={{ margin: 0, minWidth: 180 }}>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s[0].toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="empty-state">No orders here yet.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {visible.map((o) => (
              <tr key={o.id}>
                <td>{o.orderNumber}</td>
                <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                <td>
                  {o.customerName}
                  <br />
                  <span style={{ color: "#6b6b63", fontSize: "0.8rem" }}>{o.phone}</span>
                </td>
                <td>{o.items.map((i) => `${i.name} x${i.qty}`).join(", ")}</td>
                <td>GHS {o.total.toFixed(2)}</td>
                <td>
                  <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)}>
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s[0].toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <Link href={`/receipt/${o.id}`} target="_blank" className="link-btn">
                    Receipt
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

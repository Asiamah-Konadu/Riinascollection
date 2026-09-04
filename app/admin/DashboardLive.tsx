"use client";

import Link from "next/link";
import { useLiveOrders, Order } from "./LiveOrdersContext";
import LiveStatusIndicator from "./LiveStatusIndicator";

interface DashboardLiveProps {
  initialProductCount: number;
  initialPendingOrders: number;
  initialRecentOrders: Order[];
}

export default function DashboardLive({
  initialProductCount,
  initialPendingOrders,
  initialRecentOrders
}: DashboardLiveProps) {
  const { orders: liveOrders, pendingCount, newOrderIds } = useLiveOrders();

  const isLoaded = liveOrders.length > 0;
  const currentPending = isLoaded ? pendingCount : initialPendingOrders;
  const recentOrders = isLoaded ? liveOrders.slice(0, 6) : initialRecentOrders;

  // Calculate quick revenue metrics
  const totalRevenue = (isLoaded ? liveOrders : initialRecentOrders).reduce(
    (sum, o) => sum + o.total,
    0
  );

  return (
    <>
      {/* Top Welcome & Live Sync Bar */}
      <div className="dashboard-header-row">
        <div>
          <h1 className="dashboard-title">Store Overview</h1>
          <p className="dashboard-sub">Live monitoring of your shop activity & orders</p>
        </div>
        <LiveStatusIndicator />
      </div>

      {/* KPI Cards */}
      <div className="dashboard-kpi-grid">
        <div className="admin-card kpi-card">
          <div className="kpi-label">Active Products</div>
          <div className="kpi-value">{initialProductCount}</div>
          <Link href="/admin/products" className="kpi-link">
            Manage catalog →
          </Link>
        </div>

        <div className={`admin-card kpi-card ${currentPending > 0 ? "kpi-attention" : ""}`}>
          <div className="kpi-label-row">
            <span className="kpi-label">Pending Orders</span>
            {currentPending > 0 && <span className="kpi-pulse-badge">Action required</span>}
          </div>
          <div className="kpi-value kpi-pending-val">{currentPending}</div>
          <Link href="/admin/orders" className="kpi-link">
            View orders →
          </Link>
        </div>

        <div className="admin-card kpi-card">
          <div className="kpi-label">Total Orders Logged</div>
          <div className="kpi-value">{isLoaded ? liveOrders.length : initialRecentOrders.length}</div>
          <div className="kpi-subtext">
            Volume: <strong>GHS {totalRevenue.toFixed(2)}</strong>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="admin-card">
        <div className="toolbar" style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h2 style={{ margin: 0 }}>Recent Orders</h2>
            {isLoaded && <span className="orders-count-badge">Live feed</span>}
          </div>
          <Link href="/admin/orders" className="btn ghost" style={{ fontSize: "0.85rem" }}>
            View all orders →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="empty-state">No orders yet.</p>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => {
                  const isNew = newOrderIds.has(o.id);
                  return (
                    <tr
                      key={o.id}
                      className={`order-table-row ${isNew ? "order-row-new" : ""}`}
                    >
                      <td>
                        <div className="order-num-wrapper">
                          <Link href={`/receipt/${o.id}`} target="_blank" className="link-btn">
                            <strong>{o.orderNumber}</strong>
                          </Link>
                          {isNew && <span className="just-arrived-pill">NEW</span>}
                        </div>
                        <span className="order-date-text">
                          {new Date(o.createdAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short"
                          })}
                        </span>
                      </td>
                      <td>
                        <strong>{o.customerName}</strong>
                        <br />
                        <span style={{ color: "#6b6b63", fontSize: "0.8rem" }}>{o.phone}</span>
                      </td>
                      <td>
                        {o.items.map((i) => (
                          <div key={i.id} style={{ fontSize: "0.85rem" }}>
                            {i.name} ×{i.qty}
                          </div>
                        ))}
                      </td>
                      <td>
                        <strong>GHS {Number(o.total).toFixed(2)}</strong>
                      </td>
                      <td>
                        <span className={`badge ${o.status}`}>{o.status}</span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <Link
                          href={`/receipt/${o.id}`}
                          target="_blank"
                          className="link-btn"
                          title="Open receipt"
                        >
                          View ↗
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

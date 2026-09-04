"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useLiveOrders, Order } from "../LiveOrdersContext";
import LiveStatusIndicator from "../LiveStatusIndicator";

const STATUSES = ["pending", "confirmed", "fulfilled"];

export default function OrderManager({ initialOrders }: { initialOrders: Order[] }) {
  const {
    orders: liveOrders,
    updateOrderStatus,
    newOrderIds
  } = useLiveOrders();

  // Use live orders once loaded, otherwise fall back to SSR initialOrders
  const orders = liveOrders.length > 0 ? liveOrders : initialOrders;

  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Status counts
  const counts = useMemo(() => {
    const c = { all: orders.length, pending: 0, confirmed: 0, fulfilled: 0 };
    orders.forEach((o) => {
      if (o.status === "pending") c.pending++;
      else if (o.status === "confirmed") c.confirmed++;
      else if (o.status === "fulfilled") c.fulfilled++;
    });
    return c;
  }, [orders]);

  // Filter and search
  const visible = useMemo(() => {
    return orders.filter((o) => {
      const matchesFilter = filter === "all" || o.status === filter;
      if (!matchesFilter) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const inNumber = o.orderNumber?.toLowerCase().includes(q);
      const inCustomer = o.customerName?.toLowerCase().includes(q);
      const inPhone = o.phone?.toLowerCase().includes(q);
      const inNote = o.note?.toLowerCase().includes(q);
      const inItems = o.items?.some((i) => i.name.toLowerCase().includes(q));

      return inNumber || inCustomer || inPhone || inNote || inItems;
    });
  }, [orders, filter, searchQuery]);

  async function handleStatusChange(id: string, newStatus: string) {
    setUpdatingId(id);
    await updateOrderStatus(id, newStatus);
    setUpdatingId(null);
  }

  return (
    <div className="admin-card orders-manager-card">
      {/* Top Header Bar */}
      <div className="orders-toolbar">
        <div className="orders-title-group">
          <h2 style={{ margin: 0 }}>Orders</h2>
          <span className="orders-count-badge">{orders.length} total</span>
        </div>

        {/* Live sync status & manual controls */}
        <LiveStatusIndicator />
      </div>

      {/* Filter Tabs & Search Row */}
      <div className="orders-filter-row">
        <div className="filter-tabs">
          <button
            type="button"
            className={`filter-tab ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All <span className="tab-pill">{counts.all}</span>
          </button>
          <button
            type="button"
            className={`filter-tab tab-pending ${filter === "pending" ? "active" : ""}`}
            onClick={() => setFilter("pending")}
          >
            Pending <span className="tab-pill pill-pending">{counts.pending}</span>
          </button>
          <button
            type="button"
            className={`filter-tab tab-confirmed ${filter === "confirmed" ? "active" : ""}`}
            onClick={() => setFilter("confirmed")}
          >
            Confirmed <span className="tab-pill">{counts.confirmed}</span>
          </button>
          <button
            type="button"
            className={`filter-tab tab-fulfilled ${filter === "fulfilled" ? "active" : ""}`}
            onClick={() => setFilter("fulfilled")}
          >
            Fulfilled <span className="tab-pill">{counts.fulfilled}</span>
          </button>
        </div>

        <div className="search-box">
          <svg
            className="search-icon"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Search order #, customer, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearchQuery("")}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      {visible.length === 0 ? (
        <div className="empty-state" style={{ textAlign: "center", padding: "40px 20px" }}>
          <div style={{ fontSize: "2rem", marginBottom: 8 }}>📦</div>
          <p style={{ margin: 0, fontWeight: 500 }}>
            {searchQuery ? "No orders match your search query." : "No orders found in this category."}
          </p>
          {searchQuery && (
            <button
              type="button"
              className="link-btn"
              style={{ marginTop: 10, fontSize: "0.85rem" }}
              onClick={() => setSearchQuery("")}
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Date & Time</th>
                <th>Customer</th>
                <th>Items & Notes</th>
                <th>Total</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((o) => {
                const isNew = newOrderIds.has(o.id);
                const isUpdating = updatingId === o.id;
                const formattedDate = new Date(o.createdAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric"
                });
                const formattedTime = new Date(o.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit"
                });

                return (
                  <tr
                    key={o.id}
                    className={`order-table-row ${isNew ? "order-row-new" : ""} ${isUpdating ? "order-row-updating" : ""}`}
                  >
                    <td>
                      <div className="order-num-wrapper">
                        <strong className="order-num-text">{o.orderNumber}</strong>
                        {isNew && <span className="just-arrived-pill">NEW</span>}
                      </div>
                    </td>
                    <td>
                      <span className="order-date-text">{formattedDate}</span>
                      <br />
                      <span className="order-time-text">{formattedTime}</span>
                    </td>
                    <td>
                      <strong>{o.customerName}</strong>
                      <br />
                      <a href={`tel:${o.phone}`} className="order-phone-link">
                        📞 {o.phone}
                      </a>
                    </td>
                    <td>
                      <div className="order-items-list">
                        {o.items.map((i) => (
                          <div key={i.id} className="order-item-chip">
                            {i.name} <span className="item-qty">×{i.qty}</span>
                          </div>
                        ))}
                      </div>
                      {o.note && (
                        <div className="order-note-callout">
                          <span className="note-icon">💬</span>
                          <span>{o.note}</span>
                        </div>
                      )}
                    </td>
                    <td>
                      <strong className="order-total-amount">GHS {o.total.toFixed(2)}</strong>
                    </td>
                    <td>
                      <div className="status-selector-wrapper">
                        <select
                          className={`status-select ${o.status}`}
                          value={o.status}
                          disabled={isUpdating}
                          onChange={(e) => handleStatusChange(o.id, e.target.value)}
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s[0].toUpperCase() + s.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <Link
                        href={`/receipt/${o.id}`}
                        target="_blank"
                        className="btn ghost receipt-link-btn"
                        title="View printable receipt"
                      >
                        Receipt ↗
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
  );
}

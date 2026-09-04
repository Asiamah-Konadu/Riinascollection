"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useLiveOrders } from "./LiveOrdersContext";

export default function NewOrderToast() {
  const { newOrderBanner, dismissBanner } = useLiveOrders();

  useEffect(() => {
    if (!newOrderBanner) return;

    const timer = setTimeout(() => {
      dismissBanner();
    }, 15000);

    return () => clearTimeout(timer);
  }, [newOrderBanner, dismissBanner]);

  if (!newOrderBanner) return null;

  const order = newOrderBanner;
  const itemsText = order.items.map((i) => `${i.name} ×${i.qty}`).join(", ");

  return (
    <div className="new-order-toast-container" role="alert">
      <div className="new-order-toast">
        <div className="toast-icon-pulse">
          <span className="toast-bell">🔔</span>
        </div>
        <div className="toast-body">
          <div className="toast-header">
            <span className="toast-badge">NEW ORDER ARRIVED</span>
            <span className="toast-order-num">{order.orderNumber}</span>
          </div>
          <div className="toast-details">
            <strong>{order.customerName}</strong> ({order.phone})
          </div>
          <div className="toast-items">{itemsText}</div>
          <div className="toast-total">
            Total: <strong>GHS {order.total.toFixed(2)}</strong>
          </div>
        </div>
        <div className="toast-actions">
          <Link
            href="/admin/orders"
            onClick={dismissBanner}
            className="toast-btn-action"
          >
            Manage →
          </Link>
          <button
            type="button"
            onClick={dismissBanner}
            className="toast-btn-close"
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

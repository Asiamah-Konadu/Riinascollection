"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "./ProductGrid";

export default function OrderModal({
  product,
  whatsappNumber,
  onClose
}: {
  product: Product;
  whatsappNumber: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim() || !phone.trim()) {
      setError("Please fill in your name and phone number.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name,
          phone,
          note,
          items: [{ productId: product.id, qty }]
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      const order = data.order;
      const waText = `Hi Riina's Collections, I just placed order ${order.orderNumber} for ${product.name} (x${qty}). My name is ${name}.`;
      window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(waText)}`, "_blank");
      router.push(`/receipt/${order.id}`);
    } catch {
      setError("Network error. Please check your connection and try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-brand-header">
          <img
            src="/Riinas_Collections_Logo_Combined.svg"
            alt="Riina's Collections Logo"
            className="modal-brand-logo"
            width={36}
            height={41}
          />
          <span className="modal-brand-text">Riina&apos;s Collections</span>
        </div>
        <h3>{product.name}</h3>
        <p className="modal-sub">GHS {product.price.toFixed(2)} · fill in your details to order</p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="name">Your name</label>
            <input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="phone">Phone number</label>
            <input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </div>
          <div className="field">
            <label>Quantity</label>
            <div className="qty-row">
              <div className="qty-controls">
                <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                  −
                </button>
                <span>{qty}</span>
                <button type="button" onClick={() => setQty((q) => Math.min(20, q + 1))}>
                  +
                </button>
              </div>
              <strong>GHS {(product.price * qty).toFixed(2)}</strong>
            </div>
          </div>
          <div className="field">
            <label htmlFor="note">Size / note (optional)</label>
            <textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. size M, colour preference" />
          </div>

          {error && <p className="field-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn ghost" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn" disabled={submitting}>
              {submitting ? "Placing order…" : "Place order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

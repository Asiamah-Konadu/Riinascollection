"use client";

import { useState } from "react";

export default function HeaderNav({
  categories,
  whatsappNumber
}: {
  categories: string[];
  whatsappNumber: string;
}) {
  const [open, setOpen] = useState(false);

  function goToFilter(cat: string) {
    setOpen(false);
    window.dispatchEvent(new CustomEvent("shop-filter", { detail: cat }));
    const el = document.getElementById("shop");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <header>
      <div className="wrap header-row">
        <a href="#top" className="wordmark" title="Riina's Collections">
          <img
            src="/Riinas_Collections_Logo_Combined.svg"
            alt="Riina's Collections Logo"
            className="brand-logo-img"
            width={46}
            height={52}
          />
          <span className="brand-text-block">
            <span className="brand-title">Riina&apos;s</span>
            <span className="brand-tagline">Collections</span>
          </span>
        </a>
        <nav className="primary" style={open ? { display: "flex", flexDirection: "column", position: "absolute", top: "100%", left: 0, right: 0, background: "var(--paper)", padding: "18px 28px", borderBottom: "1px solid var(--line)", gap: 14 } : undefined}>
          {categories.map((c) => (
            <a key={c} href="#shop" onClick={(e) => { e.preventDefault(); goToFilter(c); }}>
              {c}
            </a>
          ))}
          <a href="#how" onClick={() => setOpen(false)}>
            How to order
          </a>
        </nav>
        <div className="header-actions">
          <a
            className="btn"
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
              "Hi Riina's Collections, I'd like to place an order"
            )}`}
            target="_blank"
            rel="noopener"
          >
            <span className="long">Order on</span> WhatsApp
          </a>
          <button className="menu-toggle" aria-label="Open menu" onClick={() => setOpen((v) => !v)}>
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>
  );
}

"use client";

import { useEffect, useState } from "react";
import OrderModal from "./OrderModal";

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string | null;
  image: string | null;
};

export default function ProductGrid({
  products,
  categories,
  whatsappNumber
}: {
  products: Product[];
  categories: string[];
  whatsappNumber: string;
}) {
  const [filter, setFilter] = useState("all");
  const [orderingProduct, setOrderingProduct] = useState<Product | null>(null);

  useEffect(() => {
    function onFilter(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (typeof detail === "string") setFilter(detail);
    }
    window.addEventListener("shop-filter", onFilter);
    return () => window.removeEventListener("shop-filter", onFilter);
  }, []);

  const visible = products.filter((p) => filter === "all" || p.category === filter);

  return (
    <>
      <div className="cat-strip">
        <div className="wrap">
          <button className={`pill ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>
            All pieces
          </button>
          {categories.map((c) => (
            <button
              key={c}
              className={`pill ${filter === c ? "active" : ""}`}
              onClick={() => setFilter(c)}
              style={{ textTransform: "capitalize" }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <section className="shop" id="shop">
        <div className="wrap">
          <div className="shop-head">
            <h2>What&apos;s on the rack</h2>
            <p>Real stock, updated as new pieces come in.</p>
          </div>

          {visible.length === 0 ? (
            <p className="empty-state">Nothing here yet — check back soon.</p>
          ) : (
            <div className="grid">
              {visible.map((p) => (
                <div className="card" key={p.id}>
                  <div className="card-media">
                    {p.image ? (
                      <img src={p.image} alt={p.name} />
                    ) : (
                      <span className="placeholder">No photo yet</span>
                    )}
                  </div>
                  <div className="card-body">
                    <div className="card-cat">{p.category}</div>
                    <div className="card-name">{p.name}</div>
                    <div className="card-price">GHS {p.price.toFixed(2)}</div>
                    <button className="card-order" onClick={() => setOrderingProduct(p)}>
                      Order this piece
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {orderingProduct && (
        <OrderModal
          product={orderingProduct}
          whatsappNumber={whatsappNumber}
          onClose={() => setOrderingProduct(null)}
        />
      )}
    </>
  );
}

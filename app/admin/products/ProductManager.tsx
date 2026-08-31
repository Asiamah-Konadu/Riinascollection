"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProductForm, { ProductFormData } from "./ProductForm";

type Product = ProductFormData & { id: string };

export default function ProductManager({ initialProducts }: { initialProducts: Product[] }) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  async function refresh() {
    setFormOpen(false);
    setEditing(null);
    const res = await fetch("/api/admin/products");
    if (res.ok) {
      const data = await res.json();
      setProducts(data.products);
    }
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } else {
      alert("Could not delete product.");
    }
  }

  return (
    <div className="admin-card">
      <div className="toolbar">
        <h2 style={{ marginBottom: 0 }}>Products</h2>
        <button
          className="btn"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          + Add product
        </button>
      </div>

      {formOpen && (
        <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid var(--line)" }}>
          <ProductForm
            initial={editing || undefined}
            onSaved={refresh}
            onCancel={() => {
              setFormOpen(false);
              setEditing(null);
            }}
          />
        </div>
      )}

      {products.length === 0 ? (
        <p className="empty-state">No products yet — add your first one above.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th></th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.image ? <img src={p.image} className="thumb" alt="" /> : <div className="thumb" />}</td>
                <td>{p.name}</td>
                <td style={{ textTransform: "capitalize" }}>{p.category}</td>
                <td>GHS {p.price.toFixed(2)}</td>
                <td>
                  <span className={`badge ${p.inStock ? "fulfilled" : "pending"}`}>
                    {p.inStock ? "In stock" : "Hidden"}
                  </span>
                </td>
                <td>
                  <button
                    className="link-btn"
                    onClick={() => {
                      setEditing(p);
                      setFormOpen(true);
                    }}
                  >
                    Edit
                  </button>
                  {" · "}
                  <button className="link-btn danger-link" onClick={() => handleDelete(p.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

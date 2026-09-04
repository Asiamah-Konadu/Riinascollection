"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import ProductForm, { ProductFormData } from "./ProductForm";

type Product = ProductFormData & { id: string };

export default function ProductManager({ initialProducts }: { initialProducts: Product[] }) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category.toLowerCase().trim());
    });
    return Array.from(set).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        selectedCategory === "all" || p.category.toLowerCase().trim() === selectedCategory;
      const matchesSearch =
        !search.trim() ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(search.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, search]);

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

  async function handleToggleStock(product: Product) {
    const newStock = !product.inStock;
    setTogglingId(product.id);
    // Optimistic update
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, inStock: newStock } : p))
    );

    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inStock: newStock })
      });
      if (!res.ok) {
        // Revert on failure
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, inStock: product.inStock } : p))
        );
        alert("Failed to update product status.");
      }
    } catch {
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, inStock: product.inStock } : p))
      );
      alert("Network error updating status.");
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert("Could not delete product.");
      }
    } catch {
      alert("Network error while deleting product.");
    } finally {
      setDeletingId(null);
    }
  }

  function handleOpenAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  function handleOpenEdit(product: Product) {
    setEditing(product);
    setFormOpen(true);
  }

  return (
    <div className="admin-card products-manager-card">
      {/* Top Header & Action Toolbar */}
      <div className="products-toolbar">
        <div className="products-title-group">
          <h2 style={{ margin: 0 }}>Products</h2>
          <span className="products-count-badge">
            {products.length} {products.length === 1 ? "item" : "items"}
          </span>
        </div>

        <button
          type="button"
          className="btn gold add-product-btn"
          onClick={handleOpenAdd}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Add product</span>
        </button>
      </div>

      {/* Form Drawer / Modal */}
      {formOpen && (
        <div className="product-form-container">
          <div className="product-form-header">
            <h3>{editing ? "Edit Product" : "Add New Product"}</h3>
            <button
              type="button"
              className="product-form-close-btn"
              onClick={() => {
                setFormOpen(false);
                setEditing(null);
              }}
              aria-label="Close form"
            >
              ✕
            </button>
          </div>
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

      {/* Search & Category Filter Bar */}
      <div className="products-filter-row">
        <div className="products-search-box">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="search-icon">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Search products by name or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="products-search-input"
          />
          {search && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Filter Pills (horizontal scrolling on mobile) */}
        <div className="products-category-scroll">
          <button
            type="button"
            className={`category-pill ${selectedCategory === "all" ? "active" : ""}`}
            onClick={() => setSelectedCategory("all")}
          >
            All ({products.length})
          </button>
          {categories.map((cat) => {
            const count = products.filter((p) => p.category.toLowerCase().trim() === cat).length;
            return (
              <button
                key={cat}
                type="button"
                className={`category-pill ${selectedCategory === cat ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Products Display */}
      {products.length === 0 ? (
        <div className="products-empty-state">
          <div className="empty-icon">👗</div>
          <h3>No products in store yet</h3>
          <p>Click &ldquo;+ Add product&rdquo; above to list your first catalog item.</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="products-empty-state">
          <div className="empty-icon">🔍</div>
          <h3>No matching products</h3>
          <p>No products found matching &ldquo;{search}&rdquo; in this category.</p>
          <button
            type="button"
            className="btn ghost"
            style={{ marginTop: 12 }}
            onClick={() => {
              setSearch("");
              setSelectedCategory("all");
            }}
          >
            Reset filters
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Table View (wrapped in horizontal scroll container for safe responsive fallback) */}
          <div className="product-table-wrapper">
            <table className="data-table product-data-table">
              <thead>
                <tr>
                  <th style={{ width: 64 }}>Photo</th>
                  <th>Product Details</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Availability</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="product-row">
                    <td>
                      <div className="product-thumb-frame">
                        {p.image ? (
                          <img src={p.image} className="product-thumb-img" alt={p.name} />
                        ) : (
                          <div className="product-thumb-placeholder">
                            <span>👗</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="product-name-block">
                        <strong className="product-name-text">{p.name}</strong>
                        {p.description && (
                          <p className="product-desc-snippet" title={p.description}>
                            {p.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="product-category-chip">{p.category}</span>
                    </td>
                    <td>
                      <strong className="product-price-tag">GHS {p.price.toFixed(2)}</strong>
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`product-stock-toggle-btn ${p.inStock ? "in-stock" : "hidden"}`}
                        onClick={() => handleToggleStock(p)}
                        disabled={togglingId === p.id}
                        title="Click to toggle availability"
                      >
                        <span className="stock-dot" />
                        <span>{p.inStock ? "In Stock" : "Hidden"}</span>
                      </button>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div className="product-action-btns">
                        <button
                          type="button"
                          className="product-btn-edit"
                          onClick={() => handleOpenEdit(p)}
                          title="Edit product"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          className="product-btn-delete"
                          onClick={() => handleDelete(p.id)}
                          disabled={deletingId === p.id}
                          title="Delete product"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View (Optimized for Phones and Small Screens) */}
          <div className="product-mobile-cards-list">
            {filteredProducts.map((p) => (
              <div key={p.id} className="product-mobile-card">
                <div className="product-mobile-top-row">
                  <div className="product-mobile-image-wrap">
                    {p.image ? (
                      <img src={p.image} className="product-mobile-img" alt={p.name} />
                    ) : (
                      <div className="product-mobile-placeholder">
                        <span>👗</span>
                      </div>
                    )}
                  </div>

                  <div className="product-mobile-meta">
                    <div className="product-mobile-title-row">
                      <strong className="product-mobile-name">{p.name}</strong>
                    </div>

                    <div className="product-mobile-tags-row">
                      <span className="product-category-chip">{p.category}</span>
                      <span className="product-mobile-price">GHS {p.price.toFixed(2)}</span>
                    </div>

                    {p.description && (
                      <p className="product-mobile-desc">{p.description}</p>
                    )}

                    <div className="product-mobile-stock-row">
                      <button
                        type="button"
                        className={`product-stock-toggle-btn ${p.inStock ? "in-stock" : "hidden"}`}
                        onClick={() => handleToggleStock(p)}
                        disabled={togglingId === p.id}
                      >
                        <span className="stock-dot" />
                        <span>{p.inStock ? "In Stock (Visible)" : "Hidden from Shop"}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="product-mobile-actions-bar">
                  <button
                    type="button"
                    className="product-mobile-btn-edit"
                    onClick={() => handleOpenEdit(p)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    <span>Edit Details</span>
                  </button>

                  <button
                    type="button"
                    className="product-mobile-btn-delete"
                    onClick={() => handleDelete(p.id)}
                    disabled={deletingId === p.id}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

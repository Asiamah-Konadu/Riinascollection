"use client";

import { useState } from "react";

export type ProductFormData = {
  id?: string;
  name: string;
  category: string;
  price: number;
  description: string | null;
  image: string | null;
  inStock: boolean;
};

const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // 4MB, keeps rows reasonable in Postgres

export default function ProductForm({
  initial,
  onSaved,
  onCancel
}: {
  initial?: Partial<ProductFormData>;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name || "");
  const [category, setCategory] = useState(initial?.category || "");
  const [price, setPrice] = useState(initial?.price?.toString() || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [image, setImage] = useState<string | null>(initial?.image || null);
  const [inStock, setInStock] = useState(initial?.inStock ?? true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) {
      setError("Image is too large — please use a photo under 4MB.");
      return;
    }
    setError("");
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const priceNum = Number(price);
    if (!name.trim() || !category.trim() || Number.isNaN(priceNum) || priceNum < 0) {
      setError("Please fill in name, category, and a valid price.");
      return;
    }

    setSubmitting(true);
    const body = { name, category, price: priceNum, description, image, inStock };
    const url = initial?.id ? `/api/admin/products/${initial.id}` : "/api/admin/products";
    const method = initial?.id ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Could not save product.");
      setSubmitting(false);
      return;
    }

    onSaved();
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="field">
          <label htmlFor="p-name">Product name</label>
          <input id="p-name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="p-category">Category</label>
          <input
            id="p-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. skirt, joggers, dress, top"
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="field">
          <label htmlFor="p-price">Price (GHS)</label>
          <input id="p-price" type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="p-stock">Availability</label>
          <select id="p-stock" value={inStock ? "yes" : "no"} onChange={(e) => setInStock(e.target.value === "yes")}>
            <option value="yes">In stock — shown on site</option>
            <option value="no">Out of stock — hidden from site</option>
          </select>
        </div>
      </div>

      <div className="field">
        <label htmlFor="p-desc">Description (optional)</label>
        <textarea id="p-desc" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <div className="field">
        <label htmlFor="p-image">Product photo</label>
        <input id="p-image" type="file" accept="image/*" onChange={handleFile} />
        {image && <img src={image} alt="Preview" className="image-preview" />}
      </div>

      {error && <p className="field-error">{error}</p>}

      <div className="modal-actions">
        <button type="button" className="btn ghost" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className="btn" disabled={submitting}>
          {submitting ? "Saving…" : "Save product"}
        </button>
      </div>
    </form>
  );
}

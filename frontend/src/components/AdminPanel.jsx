// src/components/AdminPanel.jsx
import { useState } from "react";
import { createFood } from "../utils/api";

export default function AdminPanel() {
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    imageUrl: "",
  });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    setLoading(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price) || 0,
      };
      await createFood(payload);
      setStatus("Food created successfully");
      setForm({ name: "", price: "", category: "", description: "", imageUrl: "" });
    } catch (err) {
      setStatus(err?.message || "Failed to create food");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="admin" className="admin-panel">
      <h2>Admin Panel</h2>
      <form onSubmit={onSubmit} className="admin-form">
        <div className="row">
          <label>Name</label>
          <input name="name" value={form.name} onChange={onChange} placeholder="Food name" required />
        </div>
        <div className="row">
          <label>Price</label>
          <input name="price" value={form.price} onChange={onChange} placeholder="0" required type="number" min="0" />
        </div>
        <div className="row">
          <label>Category</label>
          <input name="category" value={form.category} onChange={onChange} placeholder="Veg / Non-Veg" />
        </div>
        <div className="row">
          <label>Description</label>
          <input name="description" value={form.description} onChange={onChange} placeholder="Short description" />
        </div>
        <div className="row">
          <label>Image URL</label>
          <input name="imageUrl" value={form.imageUrl} onChange={onChange} placeholder="https://..." />
        </div>
        <div className="row">
          <button className="btn primary" type="submit" disabled={loading}>{loading ? "Saving..." : "Create"}</button>
        </div>
        {status && (
          <div className="status" style={{ marginTop: 8 }}>{status}</div>
        )}
      </form>
    </section>
  );
}

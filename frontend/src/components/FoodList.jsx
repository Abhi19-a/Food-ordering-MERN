// src/components/FoodList.jsx
import { useEffect, useState } from "react";
import { fetchFoods } from "../utils/api";

export default function FoodList() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;
    fetchFoods()
      .then((data) => {
        if (mounted) setFoods(data);
      })
      .catch((e) => {
        console.error(e);
        if (mounted) setErr(e.message || "Error");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => (mounted = false);
  }, []);

  if (loading) return <div className="center">Loading foods…</div>;
  if (err) return <div className="center" style={{ color: "tomato" }}>{err}</div>;
  if (!foods.length) return <div className="center">No foods found.</div>;

  // local overrides for specific items
  const localMap = {
    "Chicken Gravy Parota": "/images/chicken-gravy-parota.png",
    // add other local overrides if you want
  };

  return (
    <div className="food-grid">
      {foods.map((f) => {
        const imgSrc = localMap[f.name] || f.imageUrl || "/images/placeholder.jpg";
        return (
          <div className="food-card" key={f._id}>
            <img className="food-img" src={imgSrc} alt={f.name} />
            <div className="food-body">
              <div className="food-title">{f.name}</div>
              <div className="food-meta">{f.category} • ₹{f.price}</div>
              <div className="food-desc">{f.description}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// src/components/FoodList.jsx
import { useEffect, useState } from "react";
import { fetchFoods } from "../utils/api";

export default function FoodList() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [searchText, setSearchText] = useState("");
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

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

  // local overrides for specific items (only use if imageUrl is not available in the database)
  const localMap = {
    // "Item Name": "image_url_here",
  };

  // deduplicate items by name+category+price to avoid visible duplicates
  const uniqueFoods = (() => {
    const seen = new Map();
    for (const f of foods) {
      const key = `${(f.name || '').trim().toLowerCase()}|${(f.category || '').trim().toLowerCase()}|${f.price}`;
      if (!seen.has(key)) seen.set(key, f);
    }
    return Array.from(seen.values());
  })();

  const normalize = (s = "") => s.toString().toLowerCase();
  
  // Get all unique categories for filter buttons
  const categories = ["All", ...new Set(foods.map(food => food.category))];
  
  const displayFoods = uniqueFoods.filter((f) => {
    // Apply category filter
    if (activeCategory !== "All" && f.category !== activeCategory) {
      return false;
    }
    
    // Apply search query
    if (query) {
      const q = normalize(query);
      return (
        normalize(f.name).includes(q) ||
        normalize(f.category).includes(q) ||
        (f.description && normalize(f.description).includes(q))
      );
    }
    
    return true;
  });

  const onSearch = (e) => {
    e.preventDefault();
    setQuery(searchText.trim());
  };

  return (
    <div>
      <div className="category-filters" style={{ marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {categories.map(category => (
          <button
            key={category}
            onClick={() => {
              setActiveCategory(category);
              setQuery('');
              setSearchText('');
            }}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: '1px solid #ddd',
              background: activeCategory === category ? '#ff6b6b' : '#fff',
              color: activeCategory === category ? '#fff' : '#333',
              cursor: 'pointer',
              transition: 'all 0.3s',
              fontWeight: '500',
              fontSize: '14px',
              whiteSpace: 'nowrap'
            }}
          >
            {category}
          </button>
        ))}
      </div>
      
      <form onSubmit={onSearch} className="explore-search" style={{ display: "flex", gap: 8, margin: "16px 0" }}>
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder={`Search ${activeCategory === 'All' ? 'all foods' : activeCategory}...`}
          style={{ flex: 1, padding: 8 }}
        />
        <button type="submit" className="btn">Search</button>
      </form>

      {displayFoods.length === 0 ? (
        <div className="center" style={{ margin: "24px 0" }}>No results found.</div>
      ) : (
      <div className="food-grid">
      {displayFoods.map((f) => {
        const imgSrc = localMap[f.name] || f.imageUrl || "https://placehold.co/400x300?text=Food+Image";
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
      )}
    </div>
  );
}

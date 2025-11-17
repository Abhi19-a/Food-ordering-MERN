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

  // Map of food names to their image paths
  const localMap = {
    "Buns": "/images/Buns.jpg",
    "Chapathi Kurma": "/images/Chapathi Kurma.jpg",
    "Idli Vada": "/images/Idli Vada.jpg",
    "Onion Dosa": "/images/Onion Dosa.jpg",
    "Plain Dosa": "/images/Plain Dosa.jpg",
    "Pulav": "/images/Pulav.jpg",
    "Puri Baji": "/images/Puri Baji.jpg",
    "Set Dosa": "/images/Set Dosa.jpg",
    "Tuppa Dosa": "/images/Tuppa Dosa.jpg",
    "Veg Burger": "/images/Veg Burger.jpg"
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
  
  // Get all unique categories for filter buttons, removing duplicates and combining 'Juices' into 'Juices & Beverages'
  const categories = ["All"];
  const seenCategories = new Set();
  
  foods.forEach(food => {
    // Normalize category names to handle case variations
    const normalizedCategory = food.category ? food.category.trim() : '';
    if (normalizedCategory && !seenCategories.has(normalizedCategory)) {
      // If we find 'Juices' but not 'Juices & Beverages', add the latter instead
      if (normalizedCategory.toLowerCase() === 'juices' && !seenCategories.has('Juices & Beverages')) {
        seenCategories.add('Juices & Beverages');
      } else if (normalizedCategory.toLowerCase() !== 'juices') {
        seenCategories.add(normalizedCategory);
      }
    }
  });

  // Convert the set back to an array and sort it
  const sortedCategories = Array.from(seenCategories).sort();
  categories.push(...sortedCategories);
  
  const displayFoods = uniqueFoods.filter((f) => {
    // Apply category filter
    if (activeCategory !== "All") {
      // Show items that match the active category, or 'Juices' when 'Juices & Beverages' is selected
      const categoryMatch = f.category === activeCategory || 
                          (activeCategory === 'Juices & Beverages' && f.category === 'Juices');
      if (!categoryMatch) {
        return false;
      }
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

  // Group foods by category
  const foodsByCategory = displayFoods.reduce((acc, food) => {
    const category = food.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(food);
    return acc;
  }, {});

  return (
    <div className="food-list-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <form onSubmit={onSearch} className="explore-search" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder={`Search ${activeCategory === 'All' ? 'all foods' : activeCategory}...`}
              style={{ 
                flex: 1, 
                padding: '10px', 
                borderRadius: '5px',
                border: '1px solid #ddd',
                fontSize: '16px'
              }}
            />
            <button 
              type="submit" 
              className="btn"
              style={{
                padding: '0 20px',
                backgroundColor: '#ff6b6b',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Search
            </button>
          </div>
        </form>

        <div className="category-filters" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
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
      </div>

      {displayFoods.length === 0 ? (
        <div className="center" style={{ margin: '40px 0', fontSize: '18px', color: '#666' }}>
          No food items found. Try a different search or category.
        </div>
      ) : (
        <div className="food-list">
          {Object.entries(foodsByCategory).map(([category, items]) => (
            <div key={category} className="category-section" style={{ marginBottom: '40px' }}>
              <h2 style={{
                padding: '10px 0',
                borderBottom: '2px solid #ff6b6b',
                color: '#333',
                margin: '30px 0 20px',
                fontSize: '22px',
                fontWeight: '600',
                textTransform: 'capitalize'
              }}>
                {category}
              </h2>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '20px' 
              }}>
                {items.map((f) => {
                  const imgSrc = localMap[f.name] || f.imageUrl || "https://placehold.co/400x300?text=Food+Image";
                  return (
                    <div 
                      key={f._id} 
                      className="food-item" 
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        padding: '15px',
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        transition: 'all 0.3s ease',
                        backgroundColor: '#fff',
                        height: '100%',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: '0 6px 16px rgba(0,0,0,0.15)'
                        }
                      }}
                    >
                      <div style={{ 
                        width: '100%',
                        height: '200px',
                        borderRadius: '8px',
                        overflow: 'hidden'
                      }}>
                        <img 
                          src={imgSrc} 
                          alt={f.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.3s ease'
                          }}
                        />
                      </div>
                      <div style={{ padding: '0 5px' }}>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '8px'
                        }}>
                          <h3 style={{ 
                            margin: 0, 
                            fontSize: '18px',
                            fontWeight: '600',
                            color: '#333'
                          }}>
                            {f.name}
                          </h3>
                          <span style={{ 
                            fontWeight: 'bold',
                            color: '#ff6b6b',
                            fontSize: '18px',
                            fontWeight: '600'
                          }}>
                            ₹{f.price}
                          </span>
                        </div>
                        {f.description && (
                          <p style={{ 
                            margin: '8px 0 0',
                            color: '#666',
                            fontSize: '14px',
                            lineHeight: '1.5'
                          }}>
                            {f.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

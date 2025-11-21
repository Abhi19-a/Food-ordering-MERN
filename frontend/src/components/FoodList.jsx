// src/components/FoodList.jsx
import { useEffect, useState } from "react";
import { useApi } from "../api";
import { localImageMap, toSlug } from "../data/localImages";

export default function FoodList() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [searchText, setSearchText] = useState("");
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [cart, setCart] = useState([]);
  const [activeItem, setActiveItem] = useState(null);
  const [cartQuantity, setCartQuantity] = useState(1);
  const [showCartModal, setShowCartModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const { getFoods } = useApi();

  const syncCartItem = (food, quantity) => {
    setCart((prev) => {
      const idx = prev.findIndex((item) => item._id === food._id);
      if (quantity <= 0) {
        if (idx === -1) return prev;
        return prev.filter((item) => item._id !== food._id);
      }
      if (idx === -1) {
        return [...prev, { ...food, quantity }];
      }
      const copy = [...prev];
      copy[idx] = { ...copy[idx], quantity };
      return copy;
    });
  };

  const openCartModal = (food) => {
    const existing = cart.find((item) => item._id === food._id);
    const initialQty = existing?.quantity || 1;
    setActiveItem(food);
    setCartQuantity(initialQty);
    syncCartItem(food, initialQty);
    setShowCartModal(true);
  };

  const closeCartModal = () => {
    setShowCartModal(false);
    setActiveItem(null);
    setCartQuantity(1);
  };

  const closeReviewModal = () => setShowReviewModal(false);

  const handleAddMore = () => {
    if (!activeItem) return;
    setCartQuantity((prevQty) => {
      const nextQty = prevQty + 1;
      syncCartItem(activeItem, nextQty);
      return nextQty;
    });
  };

  const handleCancelOrder = () => {
    if (!activeItem) return;
    syncCartItem(activeItem, 0);
    closeCartModal();
  };

  const handleRemoveFromCart = (foodId) => {
    const food = cart.find((item) => item._id === foodId);
    if (!food) return;
    syncCartItem(food, 0);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    let mounted = true;

    const loadFoods = async () => {
      try {
        const data = await getFoods();
        if (mounted) setFoods(data);
      } catch (e) {
        console.error(e);
        if (mounted) setErr(e.message || "Error");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadFoods();

    return () => {
      mounted = false;
    };
  }, [getFoods]);

  if (loading) return <div className="center">Loading foods…</div>;
  if (err) return <div className="center" style={{ color: "tomato" }}>{err}</div>;
  if (!foods.length) return <div className="center">No foods found.</div>;

  const getLocalImage = (name) => localImageMap[toSlug(name)] || null;

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
    <div className="food-list-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', position: 'relative' }}>
      {cart.length > 0 && (
        <div style={{
          position: 'sticky',
          top: '10px',
          zIndex: 5,
          marginBottom: '20px'
        }}>
          <div style={{
            background: '#0f172a',
            color: 'white',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 10px 25px rgba(15,23,42,0.35)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div>
              <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>Cart</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{cartItemsCount} item{cartItemsCount === 1 ? '' : 's'}</div>
              <div style={{ fontSize: '0.95rem', opacity: 0.8 }}>Total ₹{cartTotal.toFixed(2)}</div>
            </div>
            <button
              style={{
                background: '#22c55e',
                border: 'none',
                color: '#0f172a',
                borderRadius: '12px',
                padding: '0.75rem 1.5rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              onClick={() => setShowReviewModal(true)}
            >
              Review Cart
            </button>
          </div>
        </div>
      )}

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
                  const imgSrc = f.imageUrl || getLocalImage(f.name) || "https://placehold.co/400x300?text=Food+Image";
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
                            transition: 'transform 0.3s ease',
                            cursor: 'pointer'
                          }}
                          onClick={() => openCartModal(f)}
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

      {showCartModal && activeItem && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15,23,42,0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '1rem'
        }}>
          <div style={{
            background: '#0f172a',
            color: '#f8fafc',
            borderRadius: '20px',
            maxWidth: '420px',
            width: '100%',
            padding: '2rem',
            boxShadow: '0 30px 60px rgba(15,23,42,0.5)',
            border: '1px solid rgba(226,232,240,0.15)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, color: '#f8fafc' }}>{activeItem.name}</h3>
                <p style={{ margin: '0.25rem 0', color: '#cbd5f5' }}>₹{activeItem.price.toFixed(2)} each</p>
              </div>
              <button
                onClick={closeCartModal}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#cbd5f5'
                }}
              >
                &times;
              </button>
            </div>

            <div style={{
              background: 'rgba(226,232,240,0.08)',
              borderRadius: '16px',
              padding: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
              border: '1px solid rgba(148,163,184,0.15)'
            }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#cbd5f5' }}>Quantity</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc' }}>{cartQuantity}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#cbd5f5' }}>Subtotal</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc' }}>₹{(activeItem.price * cartQuantity).toFixed(2)}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={handleAddMore}
                style={{
                  flex: 1,
                  background: '#22c55e',
                  border: 'none',
                  color: '#0f172a',
                  padding: '0.85rem',
                  borderRadius: '999px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Add More
              </button>
              <button
                onClick={handleCancelOrder}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: '1px solid rgba(226,232,240,0.3)',
                  color: '#f8fafc',
                  padding: '0.85rem',
                  borderRadius: '999px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showReviewModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15,23,42,0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 40,
          padding: '1rem'
        }}>
          <div style={{
            background: '#0f172a',
            color: '#f8fafc',
            borderRadius: '20px',
            maxWidth: '540px',
            width: '100%',
            padding: '2rem',
            boxShadow: '0 30px 60px rgba(15,23,42,0.5)',
            border: '1px solid rgba(226,232,240,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, color: '#f8fafc' }}>Cart Summary</h3>
              <button
                onClick={closeReviewModal}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#cbd5f5'
                }}
              >
                &times;
              </button>
            </div>

            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#cbd5f5', margin: '1.5rem 0' }}>
                Your cart is empty.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                {cart.map((item) => (
                  <div
                    key={item._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      borderRadius: '12px',
                      background: 'rgba(226,232,240,0.08)',
                      border: '1px solid rgba(148,163,184,0.15)'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: '#f8fafc' }}>{item.name}</div>
                      <div style={{ fontSize: '0.9rem', color: '#cbd5f5' }}>Qty: {item.quantity} · ₹{item.price.toFixed(2)} each</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ fontWeight: 600, color: '#f8fafc' }}>₹{(item.price * item.quantity).toFixed(2)}</div>
                      <button
                        onClick={() => handleRemoveFromCart(item._id)}
                        style={{
                          background: 'rgba(239,68,68,0.15)',
                          border: '1px solid rgba(239,68,68,0.4)',
                          color: '#f87171',
                          borderRadius: '999px',
                          padding: '0.45rem 0.9rem',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid rgba(226,232,240,0.15)',
              paddingTop: '1rem'
            }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#cbd5f5' }}>Total</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc' }}>₹{cartTotal.toFixed(2)}</div>
              </div>
              <button
                onClick={closeReviewModal}
                style={{
                  background: '#22c55e',
                  border: 'none',
                  color: '#0f172a',
                  padding: '0.85rem 1.5rem',
                  borderRadius: '999px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

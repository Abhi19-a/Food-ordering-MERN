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
  const [showPaymentModal, setShowPaymentModal] = useState(false);

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

  const handleFoodItemClick = (food) => {
    console.log('Clicked on food item:', food);
    const existing = cart.find(item => item._id === food._id);
    const initialQty = existing?.quantity || 1;
    
    setActiveItem({...food});
    setCartQuantity(initialQty);
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

  const handleDecreaseQuantity = () => {
    if (!activeItem) return;
    setCartQuantity((prevQty) => {
      const nextQty = Math.max(1, prevQty - 1);
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

  const handleUpdateQuantity = (foodId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(foodId);
      return;
    }
    const food = cart.find((item) => item._id === foodId);
    if (food) {
      syncCartItem(food, newQuantity);
    }
  };

  const handleContinueShopping = () => {
    setShowReviewModal(false);
    // Scroll to top or food list
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProceedToPayment = () => {
    setShowReviewModal(false);
    setShowPaymentModal(true);
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
  
  // Build categories, merging 'Juices' into 'Juices & Beverages'
  foods.forEach(food => {
    const normalizedCategory = food.category ? food.category.trim() : '';
    if (!normalizedCategory) return;
    
    const normalized = normalize(normalizedCategory);
    
    // Skip 'Juices' category - always use 'Juices & Beverages' instead
    if (normalized === 'juices') {
      if (!seenCategories.has('Juices & Beverages')) {
        seenCategories.add('Juices & Beverages');
      }
    } 
    // Add 'Juices & Beverages' if it exists
    else if (normalized === 'juices & beverages') {
      seenCategories.add('Juices & Beverages');
    }
    // Add all other categories normally
    else if (!seenCategories.has(normalizedCategory)) {
      seenCategories.add(normalizedCategory);
    }
  });

  // Convert the set back to an array and sort it
  const sortedCategories = Array.from(seenCategories).sort();
  categories.push(...sortedCategories);
  
  const displayFoods = uniqueFoods.filter((f) => {
    // Apply category filter
    if (activeCategory !== "All") {
      const foodCategory = f.category ? f.category.trim() : '';
      const foodCategoryNormalized = normalize(foodCategory);
      
      // Show items that match the active category, or 'Juices' when 'Juices & Beverages' is selected
      const categoryMatch = f.category === activeCategory || 
                          (activeCategory === 'Juices & Beverages' && 
                           (foodCategoryNormalized === 'juices' || foodCategoryNormalized === 'juices & beverages'));
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

  // Group foods by category, normalizing 'Juices' to 'Juices & Beverages'
  const foodsByCategory = displayFoods.reduce((acc, food) => {
    let category = food.category || 'Uncategorized';
    // Normalize 'Juices' to 'Juices & Beverages' for display
    if (normalize(category) === 'juices') {
      category = 'Juices & Beverages';
    }
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(food);
    return acc;
  }, {});

  // Debug: Log state changes
  console.log('FoodList render - showCartModal:', showCartModal, 'activeItem:', activeItem?.name, 'cart:', cart);

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

      {/* TEST BUTTON - Click this to test if modal works */}
      <div style={{ marginBottom: '10px', padding: '10px', background: '#ffeb3b', borderRadius: '5px' }}>
        <button 
          onClick={() => {
            console.log('TEST BUTTON CLICKED');
            if (foods && foods.length > 0) {
              console.log('Opening cart with first food:', foods[0]);
              handleFoodItemClick(foods[0]);
            } else {
              alert('No foods loaded yet');
            }
          }}
          style={{
            padding: '10px 20px',
            background: '#ff6b6b',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          🧪 TEST: Click to Open Cart Modal (First Item)
        </button>
        <span style={{ marginLeft: '10px', fontSize: '12px' }}>
          showCartModal: {showCartModal ? 'TRUE' : 'FALSE'} | activeItem: {activeItem ? activeItem.name : 'NULL'}
        </span>
      </div>

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
                      onClick={() => handleFoodItemClick(f)}
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
                        cursor: 'pointer',
                        cursor: 'pointer',
                        position: 'relative',
                        zIndex: 1
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-5px)';
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                      }}
                    >
                      <div 
                        style={{
                          width: '100%',
                          height: '200px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          position: 'relative',
                          zIndex: 1
                        }}
                      >
                        <img 
                          src={imgSrc} 
                          alt={f.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.3s ease',
                            pointerEvents: 'none',
                            userSelect: 'none',
                            WebkitUserSelect: 'none',
                            WebkitTouchCallout: 'none'
                          }}
                          draggable={false}
                        />
                      </div>
                      <div style={{ padding: '0 5px' }}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '8px'
                          }}
                        >
                          <h3
                            style={{
                              margin: 0,
                              fontSize: '18px',
                              fontWeight: '600',
                              color: '#333'
                            }}
                          >
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
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Add to Cart button clicked for:', f.name);
                            handleFoodItemClick(f);
                          }}
                          style={{
                            width: '100%',
                            marginTop: '12px',
                            padding: '10px',
                            background: '#ff6b6b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'background 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#ff5252';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#ff6b6b';
                          }}
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Always render modal but control visibility with display property */}
      <div 
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          display: showCartModal ? 'flex' : 'none',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
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

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <button
                onClick={handleDecreaseQuantity}
                style={{
                  flex: 1,
                  background: 'rgba(239,68,68,0.15)',
                  border: '1px solid rgba(239,68,68,0.4)',
                  color: '#f87171',
                  padding: '0.85rem',
                  borderRadius: '999px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                - Decrease
              </button>
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
                + Add More
              </button>
            </div>
            <button
              onClick={handleCancelOrder}
              style={{
                width: '100%',
                background: 'transparent',
                border: '1px solid rgba(226,232,240,0.3)',
                color: '#f8fafc',
                padding: '0.85rem',
                borderRadius: '999px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Remove from Cart
            </button>
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem', maxHeight: '400px', overflowY: 'auto' }}>
                {cart.map((item) => (
                  <div
                    key={item._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1rem',
                      borderRadius: '12px',
                      background: 'rgba(226,232,240,0.08)',
                      border: '1px solid rgba(148,163,184,0.15)',
                      gap: '1rem'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: '#f8fafc', marginBottom: '0.25rem' }}>{item.name}</div>
                      <div style={{ fontSize: '0.9rem', color: '#cbd5f5' }}>₹{item.price.toFixed(2)} each</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(226,232,240,0.1)', borderRadius: '8px', padding: '0.25rem' }}>
                        <button
                          onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                          style={{
                            background: 'rgba(239,68,68,0.2)',
                            border: '1px solid rgba(239,68,68,0.4)',
                            color: '#f87171',
                            borderRadius: '6px',
                            width: '32px',
                            height: '32px',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: '18px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          −
                        </button>
                        <span style={{ minWidth: '30px', textAlign: 'center', fontWeight: 600, color: '#f8fafc' }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                          style={{
                            background: 'rgba(34,197,94,0.2)',
                            border: '1px solid rgba(34,197,94,0.4)',
                            color: '#22c55e',
                            borderRadius: '6px',
                            width: '32px',
                            height: '32px',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: '18px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          +
                        </button>
                      </div>
                      <div style={{ minWidth: '80px', textAlign: 'right', fontWeight: 600, color: '#f8fafc' }}>
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </div>
                      <button
                        onClick={() => handleRemoveFromCart(item._id)}
                        style={{
                          background: 'rgba(239,68,68,0.15)',
                          border: '1px solid rgba(239,68,68,0.4)',
                          color: '#f87171',
                          borderRadius: '8px',
                          padding: '0.5rem 0.75rem',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '0.85rem'
                        }}
                        title="Remove item"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{
              borderTop: '1px solid rgba(226,232,240,0.15)',
              paddingTop: '1rem'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem'
              }}>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#cbd5f5' }}>Total ({cartItemsCount} {cartItemsCount === 1 ? 'item' : 'items'})</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc' }}>₹{cartTotal.toFixed(2)}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={handleContinueShopping}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: '1px solid rgba(226,232,240,0.3)',
                    color: '#f8fafc',
                    padding: '0.85rem 1.5rem',
                    borderRadius: '999px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Continue Shopping
                </button>
                <button
                  onClick={handleProceedToPayment}
                  style={{
                    flex: 1,
                    background: '#22c55e',
                    border: 'none',
                    color: '#0f172a',
                    padding: '0.85rem 1.5rem',
                    borderRadius: '999px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Proceed to Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPaymentModal && (
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
            maxWidth: '600px',
            width: '100%',
            padding: '2rem',
            boxShadow: '0 30px 60px rgba(15,23,42,0.5)',
            border: '1px solid rgba(226,232,240,0.1)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, color: '#f8fafc' }}>Payment</h2>
              <button
                onClick={() => setShowPaymentModal(false)}
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

            {/* Order Summary */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#f8fafc', fontSize: '1.1rem' }}>Order Summary</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                {cart.map((item) => (
                  <div
                    key={item._id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      background: 'rgba(226,232,240,0.08)',
                      border: '1px solid rgba(148,163,184,0.15)'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: '#f8fafc' }}>{item.name}</div>
                      <div style={{ fontSize: '0.85rem', color: '#cbd5f5' }}>Qty: {item.quantity} × ₹{item.price.toFixed(2)}</div>
                    </div>
                    <div style={{ fontWeight: 600, color: '#f8fafc' }}>₹{(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>
              <div style={{
                borderTop: '1px solid rgba(226,232,240,0.15)',
                paddingTop: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc' }}>Total</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#22c55e' }}>₹{cartTotal.toFixed(2)}</div>
              </div>
            </div>

            {/* Customer Details Form */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#f8fafc', fontSize: '1.1rem' }}>Customer Details</h3>
              <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5f5', fontSize: '0.9rem' }}>
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(148,163,184,0.3)',
                      background: 'rgba(226,232,240,0.05)',
                      color: '#f8fafc',
                      fontSize: '1rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5f5', fontSize: '0.9rem' }}>
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Enter your phone number"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(148,163,184,0.3)',
                      background: 'rgba(226,232,240,0.05)',
                      color: '#f8fafc',
                      fontSize: '1rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5f5', fontSize: '0.9rem' }}>
                    Delivery Address *
                  </label>
                  <textarea
                    required
                    placeholder="Enter your delivery address"
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(148,163,184,0.3)',
                      background: 'rgba(226,232,240,0.05)',
                      color: '#f8fafc',
                      fontSize: '1rem',
                      resize: 'vertical',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5f5', fontSize: '0.9rem' }}>
                    Payment Method *
                  </label>
                  <select
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(148,163,184,0.3)',
                      background: 'rgba(226,232,240,0.05)',
                      color: '#f8fafc',
                      fontSize: '1rem'
                    }}
                  >
                    <option value="" style={{ background: '#0f172a', color: '#f8fafc' }}>Select payment method</option>
                    <option value="cash" style={{ background: '#0f172a', color: '#f8fafc' }}>Cash on Delivery</option>
                    <option value="upi" style={{ background: '#0f172a', color: '#f8fafc' }}>UPI</option>
                    <option value="card" style={{ background: '#0f172a', color: '#f8fafc' }}>Card</option>
                  </select>
                </div>
              </form>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setShowReviewModal(true);
                }}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: '1px solid rgba(226,232,240,0.3)',
                  color: '#f8fafc',
                  padding: '0.85rem 1.5rem',
                  borderRadius: '999px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Back to Cart
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  // Handle payment submission here
                  alert('Order placed successfully! Your order will be delivered soon.');
                  setCart([]);
                  setShowPaymentModal(false);
                  setShowReviewModal(false);
                }}
                style={{
                  flex: 2,
                  background: '#22c55e',
                  border: 'none',
                  color: '#0f172a',
                  padding: '0.85rem 1.5rem',
                  borderRadius: '999px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Place Order (₹{cartTotal.toFixed(2)})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

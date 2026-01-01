// frontend/src/components/ImageGallery.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { localImageFiles, toSlug } from "../data/localImages";
import { useCart } from "../contexts/CartContext";
import "./ImageGallery.css";

const formatName = (filename) =>
  filename
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export default function ImageGallery() {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const { addToCart, cart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const loadFoods = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
        console.log("=== Loading Foods ===");
        console.log("API URL:", API_URL);
        console.log("Full endpoint:", `${API_URL}/api/foods`);
        
        // Direct fetch to test connection
        const testResponse = await fetch(`${API_URL}/api/foods`);
        console.log("Response status:", testResponse.status);
        console.log("Response ok:", testResponse.ok);
        
        if (!testResponse.ok) {
          const errorText = await testResponse.text();
          console.error("API Error:", errorText);
          throw new Error(`API returned ${testResponse.status}: ${errorText}`);
        }
        
        const foodItems = await testResponse.json();
        if (!mounted) return;

        console.log("✅ Fetched food items:", foodItems);
        console.log("✅ Number of items:", foodItems?.length || 0);
        // #region agent log (H1 H3 H5)
        const _dbgImg1 = {location:'ImageGallery.jsx:loadFoods',message:'Foods fetched from backend',data:{count:Array.isArray(foodItems)?foodItems.length:'not array',example:Array.isArray(foodItems)?foodItems.slice(0,3).map(f=>({name:f.name,imageUrl:f.imageUrl})):foodItems},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'H1_H3_H5'};
        console.log('[DEBUG LOG]', _dbgImg1);
        fetch('http://127.0.0.1:7242/ingest/1ee4de27-3e18-4bba-b840-237c70697464',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(_dbgImg1)}).catch(()=>{});
        // #endregion

        if (!foodItems || !Array.isArray(foodItems) || foodItems.length === 0) {
          console.warn("⚠️ No food items received from API");
          setFoods([]);
          setLoading(false);
          return;
        }

        // Get unique categories
        const uniqueCategories = [...new Set(foodItems.map(item => item.category).filter(Boolean))];
        setCategories(["All", ...uniqueCategories]);
        console.log("✅ Categories:", uniqueCategories);

        // Map food items with their corresponding images
        const foodsWithImages = foodItems.map(food => {
          const imageFilename = localImageFiles.find(filename => {
            const foodName = formatName(filename).toLowerCase();
            return foodName.includes(food.name.toLowerCase()) || 
                   food.name.toLowerCase().includes(foodName);
          });

          const finalImageUrl = imageFilename ? `/images/${imageFilename}` : (food.imageUrl || '/placeholder-food.jpg');
          // #region agent log (H1 H2 H3 H4)
          const _dbgImg2 = {location:'ImageGallery.jsx:map-images',message:'Image URL resolved',data:{name:food.name,backendImageUrl:food.imageUrl,matchedFilename:imageFilename,finalImageUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'H1_H2_H3_H4'};
          console.log('[DEBUG LOG]', _dbgImg2);
          fetch('http://127.0.0.1:7242/ingest/1ee4de27-3e18-4bba-b840-237c70697464',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(_dbgImg2)}).catch(()=>{});
          // #endregion

          const foodWithImage = {
            ...food,
            // Ensure price is a number
            price: Number(food.price) || 0,
            imageUrl: finalImageUrl
          };

          return foodWithImage;
        });

        console.log("✅ Processed foods with images:", foodsWithImages.length);
        console.log("✅ First item:", foodsWithImages[0]);
        setFoods(foodsWithImages);
      } catch (err) {
        console.error("❌ Error loading foods:", err);
        console.error("❌ Error message:", err.message);
        console.error("❌ Error stack:", err.stack);
        setFoods([]);
      } finally {
        setLoading(false);
      }
    };

    loadFoods();
    return () => { mounted = false; };
  }, []);

  const filteredItems = useMemo(() => {
    if (activeCategory === "All") return foods;
    return foods.filter(item => item.category === activeCategory);
  }, [activeCategory, foods]);

  // Group items by category for better display
  const groupedByCategory = useMemo(() => {
    if (activeCategory !== "All") return { [activeCategory]: filteredItems };
    
    const grouped = {};
    filteredItems.forEach(item => {
      const cat = item.category || "Other";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(item);
    });
    return grouped;
  }, [filteredItems, activeCategory]);

  const handleAddToCart = (e, food) => {
    e.stopPropagation();
    addToCart({ 
      ...food, 
      id: food._id || food.name,
      price: Number(food.price) || 0
    }, 1);
  };

  if (loading) {
    return <div className="loading">Loading delicious food items...</div>;
  }

  if (foods.length === 0 && !loading) {
    return (
      <section className="gallery-section">
        <div className="loading" style={{ padding: "40px", textAlign: "center" }}>
          <p>No food items available.</p>
          <p style={{ fontSize: "14px", color: "#666", marginTop: "10px" }}>
            Please check:
            <br />1. Backend server is running on http://localhost:4000
            <br />2. Open browser console (F12) to see error details
            <br />3. Make sure you restarted the frontend after .env changes
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="gallery-section">
      <div className="gallery-filter-row">
        <div>
          <p className="gallery-kicker">Browse by category</p>
          <h2 className="gallery-heading">Veg, Non-Veg, Snacks & more</h2>
        </div>
        <div className="gallery-filters">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={`gallery-chip${activeCategory === category ? " active" : ""}`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="loading" style={{ padding: "40px", textAlign: "center" }}>
          No items found in this category. Try selecting a different category.
        </div>
      ) : (
        <div className="gallery-container">
          {Object.entries(groupedByCategory).map(([category, items]) => (
            <div key={category} className="category-section">
              {activeCategory === "All" && (
                <h2 className="category-title">
                  {category}
                  <span className="category-count">({items.length} items)</span>
                </h2>
              )}
              <div className="gallery-grid">
                {items.map((food) => {
                  const isVeg = food.category?.toLowerCase().includes("veg");
                  const cartItem = cart.find(item => item.id === food._id || item.id === food.name);
                  const quantity = cartItem?.quantity || 0;
                  
                  return (
                    <div 
                      key={food._id || food.name}
                      className="gallery-card"
                      onClick={() => navigate(`/product/${food._id || toSlug(food.name)}`)}
                    >
                      <div className="gallery-card-badge">
                        <span className={`gallery-pill ${isVeg ? "veg" : "non-veg"}`}>
                          {isVeg ? "VEG" : "NON-VEG"}
                        </span>
                      </div>
                      {quantity > 0 && (
                        <div className="quantity-badge">
                          {quantity} in cart
                        </div>
                      )}
                      <img 
                        src={food.imageUrl} 
                        alt={food.name} 
                        onError={(e) => {
                          // #region agent log (H2 H4)
                          const _dbgImg3 = {location:'ImageGallery.jsx:onError',message:'Image failed to load',data:{name:food.name,src:e.target.src,foodImageUrl:food.imageUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'H2_H4'};
                          console.log('[DEBUG LOG]', _dbgImg3);
                          fetch('http://127.0.0.1:7242/ingest/1ee4de27-3e18-4bba-b840-237c70697464',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(_dbgImg3)}).catch(()=>{});
                          // #endregion
                          e.target.onerror = null;
                          e.target.src = '/placeholder-food.jpg';
                        }} 
                      />
                      <div className="gallery-card-content">
                        <h3 className="gallery-item-name">{food.name}</h3>
                        <div className="gallery-item-footer">
                          <span className="gallery-price">
                            ₹{food.price && food.price > 0 ? Number(food.price).toFixed(0) : "N/A"}
                          </span>
                          <button 
                            className="add-to-cart-btn"
                            onClick={(e) => handleAddToCart(e, food)}
                          >
                            {quantity > 0 ? `Add More (${quantity})` : "Add to Cart"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
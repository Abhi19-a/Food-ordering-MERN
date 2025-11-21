import { useEffect, useMemo, useState } from "react";
import { useApi } from "../api";
import { localImageFiles, toSlug } from "../data/localImages";

const formatName = (filename) =>
  filename
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export default function ImageGallery() {
  const [priceMap, setPriceMap] = useState({});
  const [categoryMap, setCategoryMap] = useState({});
  const [categories, setCategories] = useState(["All"]);
  const [activeCategory, setActiveCategory] = useState("All");
  const { getFoods } = useApi();

  useEffect(() => {
    let mounted = true;

    const loadPrices = async () => {
      try {
        const foods = await getFoods();
        if (!mounted) return;
        const priceAccumulator = {};
        const categoryAccumulator = {};
        const categorySet = new Set();

        foods.forEach((food) => {
          const slug = toSlug(food.name || "");
          if (!slug) return;
          if (priceAccumulator[slug] == null && typeof food.price === "number") {
            priceAccumulator[slug] = food.price;
          }
          if (!categoryAccumulator[slug] && food.category) {
            const normalizedCategory = food.category.trim();
            categoryAccumulator[slug] = normalizedCategory;
            categorySet.add(normalizedCategory);
          }
        });

        setPriceMap(priceAccumulator);
        setCategoryMap(categoryAccumulator);
        if (categorySet.size) {
          setCategories((prev) => {
            const ordered = Array.from(categorySet).sort((a, b) =>
              a.localeCompare(b, undefined, { sensitivity: "base" })
            );
            return ["All", ...ordered];
          });
        }
      } catch (err) {
        console.error("Unable to load prices for gallery", err);
      }
    };

    loadPrices();
    return () => {
      mounted = false;
    };
  }, [getFoods]);

  const galleryItems = localImageFiles.map((filename) => {
    const name = formatName(filename);
    const slug = toSlug(name);
    const price = priceMap[slug];
    return {
      filename,
      src: `/images/${filename}`,
      label: name,
      price: typeof price === "number" ? price : null,
      category: categoryMap[slug] || "Chef Specials"
    };
  });

  const filteredItems = useMemo(() => {
    if (activeCategory === "All") return galleryItems;
    return galleryItems.filter((item) => item.category === activeCategory);
  }, [activeCategory, galleryItems]);

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

      <div className="gallery-grid">
        {filteredItems.map((item) => {
          const isVeg = item.category?.toLowerCase().includes("veg");
          return (
          <figure key={item.filename} className="gallery-card">
            <div className="gallery-card-badge">
              <span className={`gallery-pill ${isVeg ? "veg" : "regular"}`}>{item.category}</span>
            </div>
            <img src={item.src} alt={item.label} loading="lazy" />
            <figcaption>
              <span>{item.label}</span>
              <span className="gallery-price">{item.price != null ? `₹${item.price}` : "₹--"}</span>
            </figcaption>
          </figure>
        );
        })}
      </div>
    </section>
  );
}


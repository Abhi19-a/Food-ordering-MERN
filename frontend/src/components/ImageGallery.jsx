import { useEffect, useState } from "react";
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
  const { getFoods } = useApi();

  useEffect(() => {
    let mounted = true;

    const loadPrices = async () => {
      try {
        const foods = await getFoods();
        if (!mounted) return;
        const map = foods.reduce((acc, food) => {
          const slug = toSlug(food.name || "");
          if (!slug || acc[slug] != null) return acc;
          acc[slug] = food.price;
          return acc;
        }, {});
        setPriceMap(map);
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
      price: typeof price === "number" ? price : null
    };
  });

  return (
    <section className="gallery-section">
      <div className="gallery-grid">
        {galleryItems.map((item) => (
          <figure key={item.filename} className="gallery-card">
            <img src={item.src} alt={item.label} loading="lazy" />
            <figcaption>
              <span>{item.label}</span>
              <span className="gallery-price">{item.price != null ? `₹${item.price}` : "₹--"}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}


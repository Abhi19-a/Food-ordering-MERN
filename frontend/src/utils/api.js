// src/utils/api.js
const BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export const fetchFoods = async () => {
  const res = await fetch(`${BASE}/api/foods`);
  if (!res.ok) throw new Error("Failed to fetch foods");
  return res.json();
};

export const createFood = async (food) => {
  const res = await fetch(`${BASE}/api/foods`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(food),
  });
  if (!res.ok) throw new Error("Failed to create food");
  return res.json();
};

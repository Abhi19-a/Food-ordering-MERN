export const localImageFiles = [
  "Buns.jpg",
  "Chapathi Kurma.jpg",
  "cheese-maggi.jpg",
  "chicken-biryani.jpg",
  "chicken-gravy-parota.png",
  "Dahi Vada.jpg",
  "French Fries with Cheese.jpg",
  "french-fries.jpg",
  "Idli Vada.jpg",
  "maggi.jpg",
  "masala-dosa.jpg",
  "Missel Pav.jpg",
  "Onion Dosa.jpg",
  "Onion Pakoda.jpg",
  "paneer-roll.jpg",
  "Parota Kurma.jpg",
  "peri-peri-french-fries.jpg",
  "Plain Dosa.jpg",
  "Pulav.jpg",
  "Puri Baji.jpg",
  "Schezwan Masala Dosa.jpg",
  "Set Dosa.jpg",
  "Tuppa Dosa.jpg",
  "Veg Burger.jpg",
  "Veg Cutlet.jpg"
];

export const toSlug = (value = "") =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const localImageMap = localImageFiles.reduce((acc, filename) => {
  const nameWithoutExt = filename.replace(/\.[^.]+$/, "");
  const slug = toSlug(nameWithoutExt);
  acc[slug] = `/images/${filename}`;
  return acc;
}, {});


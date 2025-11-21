// src/components/Hero.jsx

const heroImages = [
  { src: "/images/Buns.jpg", alt: "Mangalore Buns" },
  { src: "/images/Veg Burger.jpg", alt: "Veg Burger" },
  { src: "/images/chicken-biryani.jpg", alt: "Chicken Biryani" },
  { src: "/images/Chapathi Kurma.jpg", alt: "Chapathi Kurma" }
];

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-decoration hero-decoration-1" aria-hidden="true" />
      <div className="hero-decoration hero-decoration-2" aria-hidden="true" />

      <div className="hero-inner">
        <div className="hero-left">
          <p className="hero-eyebrow">Your perfect homemaker</p>
          <h1 className="hero-heading">
            Welcome to the Food Court
          </h1>
          <p className="hero-sub">
            Download our app, browse 150+ handcrafted dishes, and get piping-hot meals delivered wherever you are.
          </p>

          <div className="hero-ctas">
            <a className="btn primary" href="#">
              Download Now
            </a>
            <a className="btn ghost" href="#gallery">
              Explore Menu
            </a>
          </div>

          <div className="hero-stats">
            <div>
              <strong>150+</strong>
              <span>Dishes cooked daily</span>
            </div>
            <div>
              <strong>25 mins</strong>
              <span>Average delivery</span>
            </div>
            <div>
              <strong>4.9★</strong>
              <span>Rated by foodies</span>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-mosaic">
            {heroImages.map((image, index) => (
              <div key={image.src} className={`hero-mosaic-tile hero-mosaic-${index + 1}`}>
                <img src={image.src} alt={image.alt} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

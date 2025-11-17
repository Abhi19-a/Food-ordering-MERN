// src/components/Hero.jsx
export default function Hero() {
  // use reliable external images
  const bannerLeft = "https://images.unsplash.com/photo-1604908554007-43f2c87c37d7?q=80&w=800&auto=format&fit=crop"; // dosa-like
  const bannerRight = "https://images.unsplash.com/photo-1604908181773-5c2f4d2d5b35?q=80&w=1200&auto=format&fit=crop"; // biryani-like

  return (
    <section className="hero">
      <div className="hero-inner">
        <div className="hero-left">
          <div className="hero-brand">
            <img src="/vite.svg" alt="Food Court" className="hero-logo" />
            <div>
              <div className="brand-name">Food Court</div>
              <div className="brand-tag">Your perfect homemaker</div>
            </div>
          </div>

          <h1 className="hero-heading">
            Welcome to the <strong>Food Court</strong>
            <div className="hero-sub">
              Download Our App • Order delicious meals
            </div>
          </h1>

          <div className="hero-ctas">
            <a className="btn primary" href="#">Download Now</a>
            <a className="btn" href="#explore">Explore Menu</a>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-image-wrap">
            {/* big biryani banner */}
            <img
              className="hero-image"
              src={bannerRight}
              alt="Featured food"
              style={{
                width: "420px",
                display: "block",
                marginBottom: 12,
                borderRadius: "12px"
              }}
            />

            {/* side dosa banner */}
            <img
              className="hero-image"
              src={bannerLeft}
              alt="Featured food 2"
              style={{
                width: "220px",
                display: "block",
                borderRadius: 12,
                opacity: 0.95
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

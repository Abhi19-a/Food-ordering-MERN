// src/components/Hero.jsx

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-inner">
        <div className="hero-left">
          <div className="hero-brand">
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

        <div className="hero-right" />
      </div>
    </section>
  );
}

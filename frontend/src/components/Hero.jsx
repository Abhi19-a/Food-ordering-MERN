// src/components/Hero.jsx
const topCombos = [
  { name: "Onion Dosa Combo", tag: "Chef's pick" },
  { name: "Pulav Meal", tag: "Most ordered" },
  { name: "Chapathi Kurma", tag: "Family pack" },
];

export default function Hero() {
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
          <div style={{
            background: "#fff",
            borderRadius: "18px",
            padding: "1.5rem",
            width: "360px",
            boxShadow: "0 25px 45px rgba(15,23,42,0.15)",
            border: "1px solid rgba(15,23,42,0.05)"
          }}>
            <h3 style={{ margin: 0, fontSize: "1.2rem", color: "#0f172a" }}>Top combos today</h3>
            <p style={{ color: "#475569", marginTop: "0.25rem" }}>Freshly cooked & delivered in 30 mins.</p>

            <ul style={{ listStyle: "none", padding: 0, margin: "1.5rem 0 0", display: "flex", flexDirection: "column", gap: "1rem" }}>
              {topCombos.map((combo) => (
                <li key={combo.name} style={{
                  background: "#f8fafc",
                  borderRadius: "12px",
                  padding: "1rem",
                  border: "1px solid #e2e8f0"
                }}>
                  <div style={{ fontWeight: 600, color: "#0f172a" }}>{combo.name}</div>
                  <div style={{ fontSize: "0.9rem", color: "#475569" }}>{combo.tag}</div>
                </li>
              ))}
            </ul>

            <div style={{
              marginTop: "1.5rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div>
                <div style={{ fontSize: "2rem", fontWeight: 700, color: "#f97316" }}>15k+</div>
                <div style={{ fontSize: "0.9rem", color: "#475569" }}>Happy foodies</div>
              </div>
              <div>
                <div style={{ fontSize: "2rem", fontWeight: 700, color: "#6366f1" }}>4.9★</div>
                <div style={{ fontSize: "0.9rem", color: "#475569" }}>Avg rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

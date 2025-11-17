// src/App.jsx
import "./App.css";
import FoodList from "./components/FoodList";
import Hero from "./components/Hero";

export default function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <div className="brand">
          <h1>Food Court <small>MERN Food Ordering</small></h1>
        </div>

        <div className="nav-actions">
          <a className="btn" href="#explore">Explore Menu</a>
        </div>
      </header>

      <main>
        <Hero />
        <section id="explore">
          <FoodList />
        </section>
      </main>

      <footer className="app-footer">
        Backend: http://localhost:4000 • Frontend: Vite
      </footer>
    </div>
  );
}

// src/App.jsx
import "./App.css";
import FoodList from "./components/FoodList";
import Hero from "./components/Hero";
import AdminPanel from "./components/AdminPanel";


export default function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <div className="brand">
          <h1>Food Court <small>Demo MERN app</small></h1>
        </div>

        <div className="nav-actions">
          <a className="btn" href="#explore">Explore</a>
          <a className="btn primary" href="#admin">Admin</a>
        </div>
      </header>

      <main>
        <Hero />
        <section id="explore">
          <FoodList />
        </section>
        <AdminPanel />
      </main>

      <footer className="app-footer">
        Backend: http://localhost:4000 • Frontend: Vite
      </footer>
    </div>
  );
}

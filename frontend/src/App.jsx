// src/App.jsx
import "./App.css";
import FoodList from "./components/FoodList";
import Hero from "./components/Hero";


export default function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <div className="brand">
          <h1>Food Court <small>Demo MERN app</small></h1>
        </div>

        <div className="nav-actions">
          <button className="btn">Explore</button>
          <button className="btn primary">Admin</button>
        </div>
      </header>

      <main>
        <Hero />
        <FoodList />
      </main>

      <footer className="app-footer">
        Backend: http://localhost:4000 • Frontend: Vite
      </footer>
    </div>
  );
}

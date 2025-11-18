// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { SignedIn, SignedOut, SignIn, SignUp, RedirectToSignIn, UserButton } from "@clerk/clerk-react";
import "./App.css";
import FoodList from "./components/FoodList";
import Hero from "./components/Hero";

const HomePage = () => (
  <>
    <Hero />
    <section id="explore">
      <FoodList />
    </section>
  </>
);

const AuthPageWrapper = ({ children }) => (
  <div style={{
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    minHeight: "70vh",
    padding: "4rem 1rem",
    background: "#f8fafc"
  }}>
    <div style={{
      background: "white",
      padding: "2rem",
      borderRadius: "16px",
      boxShadow: "0 25px 45px rgba(15,23,42,0.15)"
    }}>
      {children}
    </div>
  </div>
);

const OrdersPage = () => (
  <>
    <SignedIn>
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h2>Your orders will appear here.</h2>
        <p>Coming soon!</p>
      </div>
    </SignedIn>
    <SignedOut>
      <RedirectToSignIn />
    </SignedOut>
  </>
);

const LandingPage = () => (
  <>
    <SignedIn>
      <HomePage />
    </SignedIn>
    <SignedOut>
      <AuthPageWrapper>
        <SignIn routing="path" path="/" signUpUrl="/sign-up" />
      </AuthPageWrapper>
    </SignedOut>
  </>
);

export default function App() {
  return (
    <Router>
      <div className="app-container">
        <header className="app-header">
          <div className="brand">
            <Link to="/">
              <h1>
                Food Court <small>MERN Food Ordering</small>
              </h1>
            </Link>
          </div>

          <div className="nav-actions" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <SignedIn>
              <Link className="btn btn-outline" to="/orders">
                My Orders
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <Link className="btn" to="/sign-in">
                Sign In / Sign Up
              </Link>
            </SignedOut>
          </div>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route
              path="/sign-in/*"
              element={
                <AuthPageWrapper>
                  <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
                </AuthPageWrapper>
              }
            />
            <Route
              path="/sign-up/*"
              element={
                <AuthPageWrapper>
                  <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
                </AuthPageWrapper>
              }
            />
          </Routes>
        </main>

        <footer className="app-footer">
          Backend: http://localhost:5000 • Frontend: Vite
        </footer>
      </div>
    </Router>
  );
}

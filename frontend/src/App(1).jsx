// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import { SignedIn, SignedOut, SignIn, SignUp, RedirectToSignIn, UserButton } from "@clerk/clerk-react";
import { CartProvider } from "./contexts/CartContext";
import "./App.css";
import Hero from "./components/Hero";
import ImageGallery from "./components/ImageGallery";
import ProductDetail from "./components/ProductDetail";
import CartPage from "./pages/CartPage";
import OrdersPage from "./pages/OrdersPage";

const signInLocalization = {
  signIn: {
    start: {
      title: "Sign in to FoodCourt"
    }
  }
};

const HomePage = () => (
  <>
    <Hero />
    <section id="gallery">
      <ImageGallery />
    </section>
  </>
);

const AuthPageWrapper = ({ children }) => (
  <div style={{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "calc(100vh - 200px)",
    width: "100%",
    padding: "2rem 1rem",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  }}>
    <div style={{
      background: "white",
      padding: "3rem",
      borderRadius: "20px",
      boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
      width: "100%",
      maxWidth: "450px"
    }}>
      {children}
    </div>
  </div>
);

const OrdersPageWrapper = () => (
  <>
    <SignedIn>
      <OrdersPage />
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
        <SignIn routing="path" path="/" signUpUrl="/sign-up" localization={signInLocalization} />
      </AuthPageWrapper>
    </SignedOut>
  </>
);

const AppLayout = () => {
  const location = useLocation();
  const isAuthRoute = location.pathname.startsWith("/sign-in") || location.pathname.startsWith("/sign-up");

  return (
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
            <div style={{ display: 'flex', gap: '12px' }}>
              <Link className="btn btn-outline" to="/cart">
                Cart
              </Link>
              <Link className="btn btn-outline" to="/orders">
                My Orders
              </Link>
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>
          {!isAuthRoute && (
            <SignedOut>
              <Link className="btn" to="/sign-in">
                Sign In / Sign Up
              </Link>
            </SignedOut>
          )}
        </div>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/orders" element={<OrdersPageWrapper />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route
            path="/sign-in/*"
            element={
              <AuthPageWrapper>
                <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" localization={signInLocalization} />
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
        Backend: http://localhost:4000 • Frontend: Vite
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <CartProvider>
        <AppLayout />
      </CartProvider>
    </Router>
  );
}

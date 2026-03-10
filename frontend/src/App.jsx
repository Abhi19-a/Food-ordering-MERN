// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import { SignedIn, SignedOut, SignIn, SignUp, RedirectToSignIn, UserButton, useSignIn, AuthenticateWithRedirectCallback } from "@clerk/clerk-react";
import { CartProvider } from "./contexts/CartContext";
import { useState } from "react";
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

const HomePage = () => {
  return (
    <>
      <Hero />
      <section id="gallery">
        <ImageGallery />
      </section>
    </>
  );
};

const AuthPageWrapper = ({ children }) => (
  <div style={{
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100vh",
    padding: "2rem 1rem",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    zIndex: 1000
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

const UnifiedLogin = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { isLoaded, signIn, setActive } = useSignIn();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    // Admin Flow
    if (identifier === "shopkeeper" || identifier === "admin@foodcourt.com") {
      try {
        const res = await fetch("http://localhost:4000/api/admin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: "shopkeeper", password })
        });
        const data = await res.json();
        if (data.success) {
          localStorage.setItem("adminToken", data.token);
          window.location.href = "/shopkeeper/index.html";
        } else {
          setError("Invalid admin credentials");
        }
      } catch (err) {
        setError("Error connecting to server");
      }
      return;
    }

    // Clerk Flow (Customer)
    if (!isLoaded) return;
    try {
      const result = await signIn.create({
        identifier,
        password
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        navigate("/");
      } else {
        // Needs further verification (e.g. 2FA)
        setError("Further verification required. Redirecting...");
        setTimeout(() => navigate("/sign-in"), 1500);
      }
    } catch (err) {
      setError(err.errors?.[0]?.message || "Invalid credentials");
    }
  };

  const handleGoogleSignIn = () => {
    if (!isLoaded) return;
    signIn.authenticateWithRedirect({
      strategy: "oauth_google",
      redirectUrl: "/sso-callback",
      redirectUrlComplete: "/",
    });
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2 style={{ color: "#333", marginBottom: "8px", fontWeight: "700" }}>Sign in to FoodCourt</h2>
      <p style={{ color: "#666", marginBottom: "20px", fontSize: "14px" }}>
        Welcome back! Please sign in to continue
      </p>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        style={{
          width: "100%", padding: "12px", background: "#fff", color: "#333", border: "1px solid #ccc",
          borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "14px", marginBottom: "20px",
          display: "flex", justifyContent: "center", alignItems: "center", gap: "8px"
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
        Continue with Google
      </button>

      <div style={{ display: "flex", alignItems: "center", margin: "16px 0" }}>
        <div style={{ flex: 1, height: "1px", background: "#e0e0e0" }} />
        <span style={{ margin: "0 10px", color: "#666", fontSize: "12px" }}>or</span>
        <div style={{ flex: 1, height: "1px", background: "#e0e0e0" }} />
      </div>

      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "10px", textAlign: "left" }}>
        <div>
          <label style={{ fontSize: "13px", fontWeight: "600", color: "#333", marginBottom: "4px", display: "block" }}>Email address or Username</label>
          <input
            placeholder="Enter your email or username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ccc", outline: "none", color: "#333", backgroundColor: "#fff", fontSize: "14px" }}
            required
          />
        </div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#333" }}>Password</label>
          </div>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ccc", outline: "none", color: "#333", backgroundColor: "#fff", fontSize: "14px" }}
          />
        </div>
        {error && <div style={{ color: "#e11d48", fontSize: "13px", marginTop: "4px" }}>{error}</div>}
        <button type="submit" style={{ padding: "14px", background: "#212126", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "14px", marginTop: "12px", display: "flex", justifyContent: "center", alignItems: "center", gap: "6px" }}>
          Continue <span style={{ fontSize: "16px" }}>›</span>
        </button>
      </form>
      <div style={{ marginTop: "24px", fontSize: "14px", color: "#666" }}>
        Don't have an account? <Link to="/sign-up" style={{ color: "#764ba2", fontWeight: "600", textDecoration: "none" }}>Sign up</Link>
      </div>
    </div>
  );
};

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
        <UnifiedLogin />
      </AuthPageWrapper>
    </SignedOut>
  </>
);

const AppLayout = () => {
  const location = useLocation();
  const isAuthRoute = location.pathname.startsWith("/sign-in") || location.pathname.startsWith("/sign-up");

  return (
    <div className="app-container">
      {!isAuthRoute && (<header className="app-header">
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
      </header>)}

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
            path="/sso-callback"
            element={<AuthenticateWithRedirectCallback signInUrl="/sign-in" signUpUrl="/sign-up" redirectUrl="/" />}
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

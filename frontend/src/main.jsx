import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import "./index.css";
import App from "./App.jsx";

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const MissingClerkKey = () => (
  <div style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    fontFamily: "sans-serif",
    backgroundColor: "#0f172a",
    color: "#f8fafc"
  }}>
    <div>
      <h1 style={{ marginBottom: "1rem" }}>Clerk key not configured</h1>
      <p>Add <code>VITE_CLERK_PUBLISHABLE_KEY</code> to <code>frontend/.env</code> and restart <code>npm run dev</code>.</p>
    </div>
  </div>
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {clerkPublishableKey ? (
      <ClerkProvider publishableKey={clerkPublishableKey}>
        <App />
      </ClerkProvider>
    ) : (
      <MissingClerkKey />
    )}
  </StrictMode>
);

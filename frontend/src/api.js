import { useAuth } from "@clerk/clerk-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const useApi = () => {
  const { getToken } = useAuth();

  const fetchWithAuth = async (endpoint, options = {}) => {
    const token = await getToken();

    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Something went wrong");
    }

    return response.json();
  };

  const api = {
    getFoods: () => fetchWithAuth("/api/foods"),
    getFoodById: (id) => fetchWithAuth(`/api/foods/${id}`),
    getProfile: () => fetchWithAuth("/api/users/me"),
    createOrder: (payload) =>
      fetchWithAuth("/api/orders", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  };

  return { ...api, fetchWithAuth };
};

export const api = {
  getPublicFoods: async () => {
    try {
      console.log("Fetching from:", `${API_BASE_URL}/api/foods`);
      const response = await fetch(`${API_BASE_URL}/api/foods`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        throw new Error(`Failed to fetch foods: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log("API Response received:", data?.length || 0, "items");
      return data;
    } catch (error) {
      console.error("Fetch error:", error);
      throw error;
    }
  },

  // Create Stripe Checkout session
  createCheckoutSession: async (items, successUrl, cancelUrl) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payment/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items,
          successUrl: successUrl || `${window.location.origin}/orders?success=true`,
          cancelUrl: cancelUrl || `${window.location.origin}/cart?cancelled=true`
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Failed to create checkout session");
      }

      return response.json();
    } catch (error) {
      console.error("Error creating checkout session:", error);
      throw error;
    }
  },

  // Verify Stripe payment
  verifyPayment: async (sessionId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payment/verify/${sessionId}`);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Payment verification failed");
      }

      return response.json();
    } catch (error) {
      console.error("Error verifying payment:", error);
      throw error;
    }
  },
};

export const checkApiHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    return response.ok;
  } catch (error) {
    console.error("API health check failed:", error);
    return false;
  }
};

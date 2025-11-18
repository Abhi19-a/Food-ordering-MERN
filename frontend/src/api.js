import { useAuth } from "@clerk/clerk-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

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
    const response = await fetch(`${API_BASE_URL}/api/foods`);
    if (!response.ok) {
      throw new Error("Failed to fetch foods");
    }
    return response.json();
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

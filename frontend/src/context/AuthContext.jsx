import { createContext, useState, useEffect } from "react";
import api from "../api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await api.get("/api/users/me");
      if (res.data?.user) {
        setUser(res.data.user);
      }
    } catch (err) {
      // Not logged in
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await api.post("/api/users/logout");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
      // Clear localStorage cart when logging out
      localStorage.removeItem("cart");
      localStorage.removeItem("osaiUser");
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, checkAuth, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

import { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("finova_token");
    const stored = localStorage.getItem("finova_user");
    if (token && stored) {
      try { setUser(JSON.parse(stored)); } catch (e) { /* ignore */ }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("finova_token", data.token);
    localStorage.setItem("finova_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (fullName, email, password) => {
    const { data } = await api.post("/auth/register", { fullName, email, password });
    localStorage.setItem("finova_token", data.token);
    localStorage.setItem("finova_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("finova_token");
    localStorage.removeItem("finova_user");
    setUser(null);
  };

  const updateUser = (patch) => {
    const next = { ...user, ...patch };
    setUser(next);
    localStorage.setItem("finova_user", JSON.stringify(next));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

import React, { createContext, useContext, useState, useCallback } from "react";

const SESSION_KEYS = ["username", "userEmail", "userId", "name", "role"];

function readUserFromSession() {
  return {
    username: sessionStorage.getItem("username") || "",
    email: sessionStorage.getItem("userEmail") || "",
    userId: sessionStorage.getItem("userId") || "",
    name: sessionStorage.getItem("name") || "",
    role: sessionStorage.getItem("role") || "Guest",
  };
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(readUserFromSession);

  const setUser = useCallback((userData) => {
    sessionStorage.setItem("username", userData.username || "");
    sessionStorage.setItem("userEmail", userData.email || "");
    sessionStorage.setItem("userId", userData.id || userData.userId || "");
    sessionStorage.setItem("name", userData.name || "");
    sessionStorage.setItem("role", userData.role || "Guest");
    setUserState({
      username: userData.username || "",
      email: userData.email || "",
      userId: userData.id || userData.userId || "",
      name: userData.name || "",
      role: userData.role || "Guest",
    });
  }, []);

  const logout = useCallback(() => {
    SESSION_KEYS.forEach((k) => sessionStorage.removeItem(k));
    setUserState({
      username: "",
      email: "",
      userId: "",
      name: "",
      role: "Guest",
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}

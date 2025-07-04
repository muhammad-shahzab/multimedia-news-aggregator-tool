import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(null);

  const saveToken = (tok) => {
    localStorage.setItem("token", tok);
    setToken(tok);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, saveToken, user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

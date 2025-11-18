import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Admin } from "@shared/schema";

interface AuthContextType {
  admin: Admin | null;
  login: (admin: Admin) => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/admin/me", {
          credentials: "include",
        });
        
        if (response.ok) {
          const data = await response.json();
          setAdmin(data.admin);
        } else {
          setAdmin(null);
        }
      } catch (error) {
        setAdmin(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (adminData: Admin) => {
    setAdmin(adminData);
  };

  const logout = async () => {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setAdmin(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        login,
        logout,
        isAuthenticated: !!admin,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

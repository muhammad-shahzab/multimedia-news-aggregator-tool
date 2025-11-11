

import { createContext, useContext, useState, useEffect } from "react"
import { authAPI, userAPI } from "../services/api"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem("token"))

  useEffect(() => {
    if (token) {
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [token])

  const fetchUser = async () => {
    try {
      const response = await userAPI.getProfile()
      setUser(response.data)
    } catch (error) {
      console.error("Error fetching user:", error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials)
      const { token } = response.data

      localStorage.setItem("token", token)
      setToken(token)

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      }
    }
  }

  const register = async (userData) => {
    try {
      await authAPI.register(userData)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Registration failed",
      }
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    setToken(null)
    setUser(null)
  }

  const updateUserPreferences = async (preferences) => {
    try {
      const response = await userAPI.updateProfile({ preferences })
      setUser(response.data)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Update failed",
      }
    }
  }

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUserPreferences,
    isAuthenticated: !!token,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

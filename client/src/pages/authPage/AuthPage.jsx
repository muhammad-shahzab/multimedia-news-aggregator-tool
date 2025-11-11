// src/components/AuthPage.jsx

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Card,
  CardContent,
  Box,
  Tabs,
  Tab,
  Alert,
  Snackbar,
} from "@mui/material"
import { useAuth } from "../../context/AuthContext"
import SignInForm from "../../components/auth/SignInForm"
import SignUpForm from "../../components/auth/SignUpForm"
import AuthHeader from "../../components/auth/AuthHeader"

import "./AuthPage.css" // ✅ Import vanilla CSS

const AuthPage = () => {
  const navigate = useNavigate()
  const { login, register } = useAuth()

  const [activeTab, setActiveTab] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("") // ✅ Success alert state

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [selectedInterests, setSelectedInterests] = useState([])

  const handleInterestToggle = (interestId) => {
    setSelectedInterests((prev) =>
      prev.includes(interestId)
        ? prev.filter((id) => id !== interestId)
        : [...prev, interestId]
    )
  }

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    country: "",
  })

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleLogin = async (credentials) => {
    setLoading(true)
    const result = await login(credentials)
    if (result.success) {
      navigate("/news")
    } else {
      setError(result.error || "Login failed. Try again.")
    }
    setLoading(false)
  }

  const handleRegister = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!")
      return
    }

    const payload = {
      username: formData.username.trim(),
      email: formData.email.trim(),
      password: formData.password,
      preferences: {
      topics: selectedInterests,
      regions: [formData.country],
      languages: ["en"],
      },
    }

    try {
      setLoading(true)
      const result = await register(payload)

      if (result.success) {
        setActiveTab(0)
        setSuccess("Registration successful! Please login.") // ✅ Success snackbar
      } else {
        setError(result.error || "Registration failed. Try again.")
      }
    } catch (error) {
      console.error("Registration error:", error)
      setError("Unexpected error during registration.")
    } finally {
      setLoading(false)
    }
  }

return (
  <div className="auth-page">
    {/*  Add this background video */}
    <video
      className="auth-bg-video"
      autoPlay
      loop
      muted
      playsInline
    >
      <source src="/videos/newspaper-bg.mp4" type="video/mp4" />
      Your browser does not support the video tag.
    </video>

    {/*  Add a translucent overlay to darken the background */}
    <div className="auth-overlay"></div>

    {/* login container */}
    <div className="auth-container">
      <AuthHeader />
      <Card className="auth-card">
        <Box className="auth-tabs">
          <Tabs
            value={activeTab}
            onChange={(e, v) => setActiveTab(v)}
            centered
          >
            <Tab label="Sign In" />
            <Tab label="Sign Up" />
          </Tabs>
        </Box>

        <CardContent className="auth-card-content">
          {activeTab === 0 ? (
            <SignInForm
              formData={formData}
              handleInputChange={handleInputChange}
              handleLogin={(e) => {
                e.preventDefault()
                handleLogin({
                  email: formData.email,
                  password: formData.password,
                })
              }}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              loading={loading}
            />
          ) : (
            <SignUpForm
              formData={formData}
              handleInputChange={handleInputChange}
              handleRegister={handleRegister}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              showConfirmPassword={showConfirmPassword}
              setShowConfirmPassword={setShowConfirmPassword}
              selectedInterests={selectedInterests}
              handleInterestToggle={handleInterestToggle}
              loading={loading}
            />
          )}
        </CardContent>
      </Card>
    </div>

    {/* Snackbars */}
    <Snackbar
      open={!!error}
      autoHideDuration={3000}
      onClose={() => setError("")}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert severity="error" onClose={() => setError("")}>
        {error}
      </Alert>
    </Snackbar>

    <Snackbar
      open={!!success}
      autoHideDuration={3000}
      onClose={() => setSuccess("")}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert severity="success" onClose={() => setSuccess("")}>
        {success}
      </Alert>
    </Snackbar>
  </div>
)

}

export default AuthPage

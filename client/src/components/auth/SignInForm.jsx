// src/components/auth/SignInForm.jsx
import React, { useState } from "react";
import {
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Button,
} from "@mui/material";
import { Email, Lock, Visibility, VisibilityOff } from "@mui/icons-material";
import "./css/SignInForm.css";

const SignInForm = ({
  formData,
  handleInputChange,
  handleLogin,
  showPassword,
  setShowPassword,
  loading,
}) => {
  const [errors, setErrors] = useState({ email: "", password: "" });

  // ✅ Email validation regex (strict but user-friendly)
  const validateEmail = (email) =>
    /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email.trim());

  // ✅ Validate both fields
  const validateFields = () => {
    const newErrors = { email: "", password: "" };
    let valid = true;

    // Email checks
    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
      valid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Enter a valid email (e.g. user@example.com).";
      valid = false;
    } else if (formData.email.length > 80) {
      newErrors.email = "Email must not exceed 80 characters.";
      valid = false;
    }

    // Password checks
    if (!formData.password.trim()) {
      newErrors.password = "Password is required.";
      valid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
      valid = false;
    } else if (formData.password.length > 32) {
      newErrors.password = "Password must not exceed 32 characters.";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  // ✅ On submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateFields()) handleLogin(e);
  };

  return (
    <CardContent className="signin-form">
      <Typography variant="h5" className="signin-title">
        Welcome back
      </Typography>
      <Typography variant="body2" className="signin-subtitle">
        Sign in to your <strong>Persona</strong> account
      </Typography>

      <form onSubmit={handleSubmit} noValidate>
        {/* EMAIL FIELD */}
        <TextField
          fullWidth
          label="Email"
          type="email"
          variant="outlined"
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          error={!!errors.email}
          helperText={errors.email}
          inputProps={{
            maxLength: 80, // reasonable max for email addresses
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Email className="signin-icon" />
              </InputAdornment>
            ),
          }}
          className="signin-input"
        />

        {/* PASSWORD FIELD */}
        <TextField
          fullWidth
          label="Password"
          type={showPassword ? "text" : "password"}
          variant="outlined"
          value={formData.password}
          onChange={(e) => handleInputChange("password", e.target.value)}
          error={!!errors.password}
          helperText={errors.password}
          inputProps={{
            maxLength: 32,
            minLength: 6,
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock className="signin-icon" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          className="signin-input"
        />

        {/* SUBMIT BUTTON */}
        <Button
          fullWidth
          type="submit"
          variant="contained"
          size="large"
          disabled={loading}
          className="signin-button"
        >
          {loading ? "Signing In..." : "Sign In"}
        </Button>
      </form>
    </CardContent>
  );
};

export default SignInForm;

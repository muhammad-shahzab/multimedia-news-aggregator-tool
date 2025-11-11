// src/components/auth/SignUpForm.jsx
import React from "react";
import {
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  FormControlLabel,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Person,
  TrendingUp,
  Business,
  Sports,
  Movie,
  HealthAndSafety,
  Science,
  HowToVote,
  Public,
} from "@mui/icons-material";
import "./css/SignUpForm.css";

const interestsList = [
  { id: "Technology", label: "Technology", icon: <TrendingUp /> },
  { id: "Business", label: "Business", icon: <Business /> },
  { id: "Sports", label: "Sports", icon: <Sports /> },
  { id: "Entertainment", label: "Entertainment", icon: <Movie /> },
  { id: "Health", label: "Health & Wellness", icon: <HealthAndSafety /> },
  { id: "Science", label: "Science", icon: <Science /> },
  { id: "Politics", label: "Politics", icon: <HowToVote /> },
  { id: "World", label: "World News", icon: <Public /> },
];

const SignUpForm = ({
  formData,
  handleInputChange,
  handleRegister,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  selectedInterests,
  handleInterestToggle,
  loading,
}) => {
  // Track which fields have been touched
  const [touched, setTouched] = React.useState({
    username: false,
    email: false,
    password: false,
    confirmPassword: false,
    interests: false,
  });

  // -------------------------------
  // Validation Functions
  // -------------------------------
  const validateUsername = (username) => {
    if (!username) return "Username is required";
    if (username.length < 3) return "Username must be at least 3 characters";
    if (username.length > 20) return "Username cannot exceed 20 characters";
    return "";
  };

  const validateEmail = (email) => {
    if (!email) return "Email is required";
    if (!email.includes("@") || !email.includes(".")) return "Email is invalid";
    if (email.length > 80) return "Email cannot exceed 80 characters";
    return "";
  };

  const validatePassword = (password) => {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(password)) return "Include at least one uppercase letter";
    if (!/[0-9]/.test(password)) return "Include at least one number";
    if (!/[!@#$%^&*]/.test(password)) return "Include at least one special character";
    return "";
  };

  const validateConfirmPassword = (password, confirmPassword) => {
    if (!confirmPassword) return "Please confirm your password";
    if (password !== confirmPassword) return "Passwords do not match";
    return "";
  };

  const validateInterests = (interests) => {
    if (interests.length < 3) return "Select at least 3 interests";
    return "";
  };

  // -------------------------------
  // Form Submission Handler
  // -------------------------------
  const onSubmit = (e) => {
    e.preventDefault();

    // Mark all fields as touched on submit
    setTouched({
      username: true,
      email: true,
      password: true,
      confirmPassword: true,
      interests: true,
    });

    // Check validation
    if (
      validateUsername(formData.username) ||
      validateEmail(formData.email) ||
      validatePassword(formData.password) ||
      validateConfirmPassword(formData.password, formData.confirmPassword) ||
      validateInterests(selectedInterests)
    ) {
      return; // Errors are shown inline; do not submit
    }

    handleRegister(e); // proceed to register
  };

  return (
    <CardContent className="signup-form">
      <Typography variant="h5" className="signup-title">
        Create Account
      </Typography>
      <Typography variant="body2" className="signup-subtitle">
        Join <strong>Persona</strong> for a personalized experience
      </Typography>

      <form onSubmit={onSubmit} noValidate>
        {/* Username */}
        <TextField
          fullWidth
          label="Username"
          variant="outlined"
          value={formData.username}
          onChange={(e) => handleInputChange("username", e.target.value)}
          inputProps={{ maxLength: 20 }}
          required
          error={touched.username && !!validateUsername(formData.username)}
          helperText={
            touched.username ? validateUsername(formData.username) : `${formData.username.length}/20`
          }
          onBlur={() => setTouched({ ...touched, username: true })}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Person className="signup-icon" />
              </InputAdornment>
            ),
          }}
          className="signup-input"
        />

        {/* Email */}
        <TextField
          fullWidth
          label="Email"
          type="email"
          variant="outlined"
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          inputProps={{ maxLength: 80 }}
          required
          error={touched.email && !!validateEmail(formData.email)}
          helperText={touched.email ? validateEmail(formData.email) : `${formData.email.length}/80`}
          onBlur={() => setTouched({ ...touched, email: true })}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Email className="signup-icon" />
              </InputAdornment>
            ),
          }}
          className="signup-input"
        />

        {/* Password */}
        <TextField
          fullWidth
          label="Password"
          type={showPassword ? "text" : "password"}
          variant="outlined"
          value={formData.password}
          onChange={(e) => handleInputChange("password", e.target.value)}
          inputProps={{ maxLength: 25 }}
          required
          error={touched.password && !!validatePassword(formData.password)}
          helperText={touched.password ? validatePassword(formData.password) : `${formData.password.length}/25`}
          onBlur={() => setTouched({ ...touched, password: true })}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock className="signup-icon" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          className="signup-input"
        />

        {/* Confirm Password */}
        <TextField
          fullWidth
          label="Confirm Password"
          type={showConfirmPassword ? "text" : "password"}
          variant="outlined"
          value={formData.confirmPassword}
          onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
          inputProps={{ maxLength: 25 }}
          required
          error={touched.confirmPassword && !!validateConfirmPassword(formData.password, formData.confirmPassword)}
          helperText={
            touched.confirmPassword
              ? validateConfirmPassword(formData.password, formData.confirmPassword)
              : `${formData.confirmPassword.length}/25`
          }
          onBlur={() => setTouched({ ...touched, confirmPassword: true })}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock className="signup-icon" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          className="signup-input"
        />

        {/* Interests */}
        <div className="signup-interests">
          <Typography variant="body2" className="signup-interests-label">
            Select your interests (min 3)
          </Typography>
          <div className="signup-interests-grid">
            {interestsList.map((interest) => (
              <FormControlLabel
                key={interest.id}
                control={
                  <Checkbox
                    checked={selectedInterests.includes(interest.id)}
                    onChange={() => handleInterestToggle(interest.id)}
                  />
                }
                label={
                  <div className="signup-interest-item">
                    {interest.icon}
                    <span>{interest.label}</span>
                  </div>
                }
              />
            ))}
          </div>
          {touched.interests && !!validateInterests(selectedInterests) && (
            <Typography color="error" variant="caption">
              {validateInterests(selectedInterests)}
            </Typography>
          )}
        </div>

        {/* Country */}
        <FormControl fullWidth className="signup-input">
          <InputLabel>Country/Region</InputLabel>
          <Select
            value={formData.country}
            onChange={(e) => handleInputChange("country", e.target.value)}
            label="Country/Region"
            required
          >
            <MenuItem value="pk">Pakistan</MenuItem>
            <MenuItem value="us">United States</MenuItem>
            <MenuItem value="uk">United Kingdom</MenuItem>
            <MenuItem value="ca">Canada</MenuItem>
            <MenuItem value="au">Australia</MenuItem>
            <MenuItem value="de">Germany</MenuItem>
            <MenuItem value="fr">France</MenuItem>
            <MenuItem value="in">India</MenuItem>
            <MenuItem value="jp">Japan</MenuItem>
          </Select>
        </FormControl>

        {/* Submit */}
        <Button
          fullWidth
          type="submit"
          variant="contained"
          size="large"
          disabled={loading}
          className="signup-button"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </Button>
      </form>
    </CardContent>
  );
};

export default SignUpForm;

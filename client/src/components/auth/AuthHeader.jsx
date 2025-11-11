import { Typography, Box } from "@mui/material";
import logo from "../../assets/logo.png";
import "./css/AuthHeader.css";

const AuthHeader = () => (
  <Box className="auth-header">
    <Box className="auth-header-logo">
      <img src={logo} alt="Persona Logo" className="auth-header-logo-img" />
      <Typography variant="h3" className="auth-header-title">
        Persona
      </Typography>
    </Box>

    <Typography variant="h6" className="auth-header-subtitle">
      Personalized Multimedia News Aggregator
    </Typography>
  </Box>
);

export default AuthHeader;

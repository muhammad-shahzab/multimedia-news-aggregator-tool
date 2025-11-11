
import React from "react";
import { IconButton, Tooltip } from "@mui/material";
import { Brightness4, Brightness7 } from "@mui/icons-material";
import { useThemeContext } from "../context/ThemeContext";
import "./ThemeToggle.css";

const ThemeToggle = () => {
  const { mode, toggleTheme } = useThemeContext();

  return (
    <div className="theme-toggle-container">
      <Tooltip title={`Switch to ${mode === "light" ? "dark" : "light"} mode`}>
        <IconButton
          onClick={toggleTheme}
          color="inherit"
          aria-label="toggle theme"
          size="large"
        >
          {mode === "light" ? (
            <Brightness4 className="theme-icon" />
          ) : (
            <Brightness7 className="theme-icon" />
          )}
        </IconButton>
      </Tooltip>
    </div>
  );
};

export default ThemeToggle;

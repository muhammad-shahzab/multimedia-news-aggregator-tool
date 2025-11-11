import { createContext, useContext, useMemo, useState, useEffect } from "react";
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
  CssBaseline,
} from "@mui/material";

const ThemeContext = createContext();

export const CustomThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => localStorage.getItem("theme") ?? "light");

  const toggleTheme = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  /* -------------------------------------------------------------
     1. Apply data-theme attribute + persist
     ------------------------------------------------------------- */
  useEffect(() => {
    document.documentElement.dataset.theme = mode;
    localStorage.setItem("theme", mode);
  }, [mode]);

  /* -------------------------------------------------------------
     2. MUI theme – **exactly the same values** as the CSS vars
     ------------------------------------------------------------- */
  const muiTheme = useMemo(() => {
    const light = {
      palette: {
        mode: "light",
        primary: { main: "#2563eb", dark: "#1d4ed8" },          // --color-primary / hover
        secondary: { main: "#f59e0b", dark: "#d97706" },       // --color-accent / hover
        background: {
          default: "#f8f9fb",   // --color-bg-primary
          paper: "#ffffff",     // --color-bg-secondary
        },
        text: {
          primary: "#1b1c1f",   // --color-text-primary
          secondary: "#4a4b50", // --color-text-secondary
        },
        divider: "#d1d5db",     // --color-border
      },
    };

    const dark = {
      palette: {
        mode: "dark",
        primary: { main: "#3b82f6", dark: "#60a5fa" },
        secondary: { main: "#fbbf24", dark: "#facc15" },
        background: {
          default: "#0f172a",
          paper: "#1e293b",
        },
        text: {
          primary: "#f8fafc",
          secondary: "#cbd5e1",
        },
        divider: "#334155",
      },
    };

    return createTheme(mode === "light" ? light : dark);
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => useContext(ThemeContext);
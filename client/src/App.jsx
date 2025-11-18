
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CustomThemeProvider } from "./context/ThemeContext";
import { DrawerProvider } from "./context/DrawerContext"; 
import AppRoutes from "./routes/AppRoutes";
import ThemeToggle from "./utils/ThemeToggle";
import "./Styles/theme.css";



function App() {
  return (
    <CustomThemeProvider>
      <AuthProvider>
          <DrawerProvider> 
            <Router>
              <AppRoutes />
              <ThemeToggle />
            </Router>
          </DrawerProvider>
      </AuthProvider>
    </CustomThemeProvider>
  );
}

export default App;
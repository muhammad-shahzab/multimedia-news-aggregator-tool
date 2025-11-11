



// import { BrowserRouter as Router } from "react-router-dom";
// import { AuthProvider } from "./context/AuthContext";
// import { CustomThemeProvider } from "./context/ThemeContext";
// import AppRoutes from "./routes/AppRoutes";
// import "./Styles/theme.css";

// import ThemeToggle from "./components/ThemeToggle";
// function App() {
//   return (
//     <CustomThemeProvider>
//       <AuthProvider>
//         <Router>
//           <AppRoutes />
//           <ThemeToggle/>
//         </Router>
//       </AuthProvider>
//     </CustomThemeProvider>
//   );
// }

// export default App;

// App.jsx
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CustomThemeProvider } from "./context/ThemeContext";
import { SearchProvider } from "./context/SearchContext";
import { DrawerProvider } from "./context/DrawerContext"; // ← IMPORT
import AppRoutes from "./routes/AppRoutes";
import ThemeToggle from "./utils/ThemeToggle";
import "./Styles/theme.css";

function App() {
  return (
    <CustomThemeProvider>
      <AuthProvider>
        <SearchProvider>
          <DrawerProvider> {/* ← ADD THIS */}
            <Router>
              <AppRoutes />
              <ThemeToggle />
            </Router>
          </DrawerProvider>
        </SearchProvider>
      </AuthProvider>
    </CustomThemeProvider>
  );
}

export default App;
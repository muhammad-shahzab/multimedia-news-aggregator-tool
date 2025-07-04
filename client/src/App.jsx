import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import RegisterForm from "./components/RegisterForm";
import LoginForm from "./components/LoginForm";
import PreferencesForm from "./components/PreferencesForm";
import { useContext, useEffect } from "react";
import { AuthContext } from "./context/AuthContext";
import axios from "axios";

function App() {
  const { token, setUser } = useContext(AuthContext);

  useEffect(() => {
    if (token) {
      axios.get("http://localhost:5000/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => setUser(res.data))
      .catch(() => {});
    }
  }, [token, setUser]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/preferences" element={
          token ? <PreferencesForm /> : <Navigate to="/login" />
        } />
      </Routes>
    </Router>
  );
}

export default App;

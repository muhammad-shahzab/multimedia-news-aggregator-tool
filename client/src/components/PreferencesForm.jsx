import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

export default function PreferencesForm() {
  const { token, user, setUser, logout } = useContext(AuthContext);
  const [form, setForm] = useState({
    topics: [],
    regions: [],
    languages: [],
    mediaTypes: []
  });

  useEffect(() => {
    if (user?.preferences) {
      setForm(user.preferences);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value.split(",").map((s) => s.trim())
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        "http://localhost:5000/api/user/profile",
        { preferences: form },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(res.data);
      alert("Preferences updated!");
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Preferences</h2>
      <label>Topics (comma separated)</label>
      <input name="topics" value={form.topics.join(", ")} onChange={handleChange} />

      <label>Regions (comma separated)</label>
      <input name="regions" value={form.regions.join(", ")} onChange={handleChange} />

      <label>Languages (comma separated)</label>
      <input name="languages" value={form.languages.join(", ")} onChange={handleChange} />

      <label>Media Types (comma separated)</label>
      <input name="mediaTypes" value={form.mediaTypes.join(", ")} onChange={handleChange} />

      <button type="submit">Save Preferences</button>
      <button type="button" onClick={logout}>Logout</button>
    </form>
  );
}

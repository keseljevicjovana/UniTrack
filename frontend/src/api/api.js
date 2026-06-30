import axios from "axios";

// VITE_API_URL se postavlja na Vercel-u da gadja Render backend URL.
// Lokalno (.env.local ili nepostavljeno) i dalje gadja localhost.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
  withCredentials: true,
});

export default api;
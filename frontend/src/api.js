import axios from "axios";

// Use explicit Vite env var if provided, otherwise fall back:
// - DEV -> http://localhost:21051
// - PROD -> empty string so requests go to same origin (relative routes)
const API_BASE = import.meta.env.VITE_API_BASE ?? (import.meta.env.DEV ? "http://localhost:21051" : "");

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // Important: sends cookies/session with requests
});

export default api;

import axios from "axios";

<<<<<<< HEAD
// Use localhost for local development, production URL for deployment
const API_BASE = import.meta.env.DEV
  ? "http://localhost:21051"
  : "https://cs2team51.cs2410-web01pvm.aston.ac.uk";

const api = axios.create({
  baseURL: API_BASE,
=======
// Use explicit Vite env var if provided, otherwise fall back:
// - DEV -> http://localhost:21051
// - PROD -> empty string so requests go to same origin (relative routes)
const API_BASE = import.meta.env.VITE_API_BASE ?? (import.meta.env.DEV ? "http://localhost:21051" : "");

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // Important: sends cookies/session with requests
>>>>>>> deploy-branch
});

export default api;

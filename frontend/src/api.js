import axios from "axios";

// Use explicit Vite env var if provided, otherwise fall back:
// - DEV -> http://localhost:21051
// - PROD -> live backend origin with port (so cookies stick)
const API_BASE = import.meta.env.VITE_API_BASE ?? (
  import.meta.env.DEV
    ? "http://localhost:21051"
    : "https://cs2team51.cs2410-web01pvm.aston.ac.uk:21051"
);

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // Important: sends cookies/session with requests
});

export default api;

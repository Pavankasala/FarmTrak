// src/utils/api.js
import axios from "axios";

// ✅ include /api here
export const API_BASE_URL = "https://farmtrak.onrender.com/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

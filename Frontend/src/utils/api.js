// src/utils/api.js
import axios from "axios";

// Always point to deployed backend
export const API_BASE_URL = "https://farmtrak.onrender.com";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

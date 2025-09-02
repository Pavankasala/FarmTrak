// src/utils/api.js
import axios from "axios";

export const API_BASE_URL = import.meta.env.DEV
  ? "/api"
  : "https://farmtrak.onrender.com/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

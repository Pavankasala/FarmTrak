// src/utils/api.js
import axios from "axios";

export const api = axios.create({
  baseURL: "https://farmtrak.onrender.com", // deployed backend URL
  withCredentials: true,
});

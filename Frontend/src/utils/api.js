// src/utils/api.js
import axios from "axios";

export const API_BASE_URL = "https://farmtrak.onrender.com/api";
console.log("API_BASE_URL:", API_BASE_URL);

export const api = axios.create({
  baseURL: API_BASE_URL, // use the same URL here
  withCredentials: true,
});

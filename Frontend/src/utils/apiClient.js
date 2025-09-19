import axios from "axios";
import { getCurrentUser, getToken } from "./login";

const API_BASE_URL = "https://farmtrak.onrender.com/api";

const getHeaders = () => ({
  "X-User-Email": getCurrentUser() || "",
  Authorization: getToken() ? `Bearer ${getToken()}` : undefined,
});

/**
 * A factory function to create a set of CRUD API methods for a resource.
 * @param {string} resource - The name of the resource (e.g., 'flocks', 'expenses').
 * @returns {object} An object with getAll, save, update, and delete methods.
 */
const createCrudClient = (resource) => ({
  getAll: () => axios.get(`${API_BASE_URL}/${resource}`, { headers: getHeaders() }),
  save: (data) => axios.post(`${API_BASE_URL}/${resource}`, data, { headers: getHeaders() }),
  update: (id, data) => axios.put(`${API_BASE_URL}/${resource}/${id}`, data, { headers: getHeaders() }),
  delete: (id) => axios.delete(`${API_BASE_URL}/${resource}/${id}`, { headers: getHeaders() }),
});

// Auth endpoints remain the same
function googleLogin(token) {
  return axios.post(`${API_BASE_URL}/google-login`, { token });
}
// 1. Send code to email
function register(email, username, password) {
  return axios.post(`${API_URL}/auth/register`, { email, username, password });
}
// 2. Check code and create user
function verifyAndCreateUser(email, code, username, password) {
  return axios.post(`${API_URL}/auth/verify`, { email, code, username, password });
}

// 3. Login user
function login(email, password) {
  return axios.post(`${API_URL}/auth/login`, { email, password });
}

// Export a single apiClient object with nested resources
export const apiClient = {
  googleLogin,
  register,
  verifyAndCreateUser,
  login,
  flocks: createCrudClient("flocks"),
  expenses: createCrudClient("expenses"),
  eggs: createCrudClient("eggs"),
  feedRecords: createCrudClient("feed-records"),
  revenue: createCrudClient("revenue"),
};
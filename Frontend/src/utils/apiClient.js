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

function sendVerification(email, username) {
  // Assuming your refactored auth controller is at /api/auth
  return axios.post(`${API_BASE_URL}/auth/register`, { email, username });
}

function verifyAndCreateUser(email, code, username) {
  return axios.post(`${API_BASE_URL}/auth/verify`, { email, code, username });
}

function login(email) {
  return axios.post(`${API_BASE_URL}/auth/login`, { email });
}

// Export a single apiClient object with nested resources
export const apiClient = {
  googleLogin,
  sendVerification,
  verifyAndCreateUser,
  login,
  flocks: createCrudClient("flocks"),
  expenses: createCrudClient("expenses"),
  eggs: createCrudClient("eggs"),
  feedRecords: createCrudClient("feed-records"),
  revenue: createCrudClient("revenue"),
};
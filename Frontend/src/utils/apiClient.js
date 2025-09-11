import axios from "axios";
import { getCurrentUser, getToken } from "./login";

const API_BASE_URL = "https://farmtrak.onrender.com/api";

const getHeaders = () => ({
  "X-User-Email": getCurrentUser() || "",
  Authorization: getToken() ? `Bearer ${getToken()}` : undefined,
});

// Auth endpoints
function googleLogin(token) {
  return axios.post(`${API_BASE_URL}/google-login`, { token });
}

function sendVerification(email, username) {
  return axios.post(`${API_BASE_URL}/send-verification`, { email, username });
}

function verifyEmail(email, code) {
  return axios.post(`${API_BASE_URL}/verify-email`, { email, code });
}

// Flocks
function getFlocks() {
  return axios.get(`${API_BASE_URL}/flocks`, { headers: getHeaders() });
}

function saveFlock(data) {
  return axios.post(`${API_BASE_URL}/flocks`, data, { headers: getHeaders() });
}

function updateFlock(id, data) {
  return axios.put(`${API_BASE_URL}/flocks/${id}`, data, { headers: getHeaders() });
}

function deleteFlock(id) {
  return axios.delete(`${API_BASE_URL}/flocks/${id}`, { headers: getHeaders() });
}

// Expenses
function getExpenses() {
  return axios.get(`${API_BASE_URL}/expenses`, { headers: getHeaders() });
}

function saveExpense(data) {
  return axios.post(`${API_BASE_URL}/expenses`, data, { headers: getHeaders() });
}

function updateExpense(id, data) {
  return axios.put(`${API_BASE_URL}/expenses/${id}`, data, { headers: getHeaders() });
}

function deleteExpense(id) {
  return axios.delete(`${API_BASE_URL}/expenses/${id}`, { headers: getHeaders() });
}

// Eggs
function getEggProductions() {
  return axios.get(`${API_BASE_URL}/eggs`, { headers: getHeaders() });
}

function saveEggProduction(data) {
  return axios.post(`${API_BASE_URL}/eggs`, data, { headers: getHeaders() });
}

function updateEggProduction(id, data) {
  return axios.put(`${API_BASE_URL}/eggs/${id}`, data, { headers: getHeaders() });
}

function deleteEggProduction(id) {
  return axios.delete(`${API_BASE_URL}/eggs/${id}`, { headers: getHeaders() });
}

// Feed records
function getFeedRecords() {
  return axios.get(`${API_BASE_URL}/feed-records`, { headers: getHeaders() });
}

function saveFeedRecord(data) {
  return axios.post(`${API_BASE_URL}/feed-records`, data, { headers: getHeaders() });
}

function updateFeedRecord(id, data) {
  return axios.put(`${API_BASE_URL}/feed-records/${id}`, data, { headers: getHeaders() });
}

function deleteFeedRecord(id) {
  return axios.delete(`${API_BASE_URL}/feed-records/${id}`, { headers: getHeaders() });
}

// ✅ Default export as one object, so existing imports work
export const apiClient = {
  googleLogin,
  sendVerification,
  verifyEmail,
  getFlocks,
  saveFlock,
  updateFlock,
  deleteFlock,
  getExpenses,
  saveExpense,
  updateExpense,
  deleteExpense,
  getEggProductions,
  saveEggProduction,
  updateEggProduction,
  deleteEggProduction,
  getFeedRecords,
  saveFeedRecord,
  updateFeedRecord,
  deleteFeedRecord,
};

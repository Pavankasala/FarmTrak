import axios from "axios";
import { getToken, logOut } from "./login"; 

const API_BASE_URL = "https://farmtrak.onrender.com/api";

const getHeaders = () => {
  const token = getToken(); // Get the secure token
  if (!token) {
    // If no token, log user out just in case
    logOut(); 
    return {};
  }
  
  return {
    "Authorization": `Bearer ${token}`
  };
};

axios.defaults.withCredentials = true;

const createCrudClient = (resource) => ({
  getAll: () => axios.get(`${API_BASE_URL}/${resource}`, { headers: getHeaders() }),
  save: (data) => axios.post(`${API_BASE_URL}/${resource}`, data, { headers: getHeaders() }),
  update: (id, data) => axios.put(`${API_BASE_URL}/${resource}/${id}`, data, { headers: getHeaders() }),
  delete: (id) => axios.delete(`${API_BASE_URL}/${resource}/${id}`, { headers: getHeaders() }),
});

export const apiClient = {
  flocks: createCrudClient("flocks"),
  expenses: createCrudClient("expenses"),
  eggs: createCrudClient("eggs"),
  feedRecords: createCrudClient("feed-records"),
  revenue: createCrudClient("revenue"),
};

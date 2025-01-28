import axios from "axios";
import { expressProxy } from "./proxy";
const getToken = () => localStorage.getItem('token');
const api = axios.create({
  baseURL: expressProxy,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const currentToken = getToken();
    if (currentToken) {
      config.headers.Authorization = `Bearer ${currentToken}`;
    }
    if (config.data instanceof FormData) {
      config.headers['Content-Type'] = 'multipart/form-data';
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response, 
  (error) => {
    if (error.response && error.response.status === 401) {
      window.location.href = '/';  
    }
    return Promise.reject(error);
  }
);


axios.defaults.headers.post["Content-Type"] = "application/json";

export default api;

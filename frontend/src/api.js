import axios from 'axios';

const API = axios.create({
  baseURL: 'https://stock-sim-b0o8.onrender.com/',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log("TOKEN:", token);
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export default API;

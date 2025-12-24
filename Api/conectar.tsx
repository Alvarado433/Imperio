import axios, { AxiosInstance } from "axios";

const api: AxiosInstance = axios.create({
  baseURL: "https://universoimperio.infinityfree.me/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // 🔥 ESSENCIAL PARA COOKIE (TOKEN)
});

export default api;

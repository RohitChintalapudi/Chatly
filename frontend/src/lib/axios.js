import axios from "axios";

const isDev = import.meta.env.MODE === "development";
const backendUrl = import.meta.env.VITE_API_URL || (isDev ? "http://localhost:5001" : "");

export const axiosInstance = axios.create({
  baseURL: `${backendUrl}/api`,
  withCredentials: true,
});

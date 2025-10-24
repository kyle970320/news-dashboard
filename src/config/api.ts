// lib
import axios from "axios";

export const apiInstance = axios.create({
  baseURL: `${import.meta.env.VITE_APP_API_HOST}/api`,
});

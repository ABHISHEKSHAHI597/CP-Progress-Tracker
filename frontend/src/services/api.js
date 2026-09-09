import axios from "axios";

import { clearToken, getToken } from "../lib/session";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

API.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Tokens last an hour. When one expires the session is gone, so drop it and
    // ask for the password again rather than leaving a page that quietly fails.
    // A rejected sign-in also answers 401 and must be left to the form.
    const isSignInAttempt = (error.config?.url || "").includes("/admin/login");

    if (error.response?.status === 401 && !isSignInAttempt) {
      clearToken();

      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }

    return Promise.reject(error);
  }
);

export default API;

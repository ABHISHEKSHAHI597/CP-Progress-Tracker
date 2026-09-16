import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,

  // The app and the API share an origin, so the session cookie rides along
  // regardless. This keeps it working if the API is ever pointed at its own
  // hostname instead of going through the proxy.
  withCredentials: true,
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Sessions last an hour. When one expires the cookie is gone and every
    // call starts answering 401, so tell the app to drop back to signed out
    // rather than leaving a page that quietly fails.
    //
    // Sign-in answers 401 for a wrong password too, and that belongs to the
    // form. The session check never answers 401 at all, by design.
    const url = error.config?.url || "";
    const isSignInAttempt = url.includes("/admin/login");

    if (error.response?.status === 401 && !isSignInAttempt) {
      window.dispatchEvent(new Event("auth:expired"));
    }

    return Promise.reject(error);
  }
);

export default API;

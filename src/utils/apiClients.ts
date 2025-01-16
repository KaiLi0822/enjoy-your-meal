import axios from "axios";
import { refreshToken } from "./authUtils";

// Generic API client (can be used for non-authenticated requests)
export const apiClient = axios.create({
  baseURL: "/api",
});

// Authenticated API client
export const apiAuthClient = axios.create({
  baseURL: "/api",
  withCredentials: true, // Include cookies for authenticated requests
});

// Request interceptor for authenticated client
apiAuthClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("accessToken");

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for authenticated client
apiAuthClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.error("Unauthorized, attempting to refresh token...");

      const newAccessToken = await refreshToken();

      if (newAccessToken) {
        // Retry the original request with the new token
        if (error.config.headers) {
          error.config.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return apiAuthClient.request(error.config);
      } else {
        // Handle logout or redirection if token refresh fails
        window.location.href = "/signin";
      }
    }

    return Promise.reject(error);
  }
);

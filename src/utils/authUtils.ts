import axios from "axios";

const refreshClient = axios.create({
  baseURL: "/api", // Replace with your API base URL
  withCredentials: true, // Include cookies for refresh token requests
});

export const refreshToken = async (): Promise<string | null> => {
    try {

  
      const response = await refreshClient.post("/auth/refresh", {}, { withCredentials: true });
  
      const newAccessToken = response.data.accessToken;
  
      // Store the new access token in sessionStorage
      sessionStorage.setItem("accessToken", newAccessToken);
  
      console.log("Access token refreshed successfully");
      return newAccessToken;
    } catch (error) {
      console.error("Failed to refresh token:", error);
      sessionStorage.removeItem("accessToken"); // Remove the access token if refresh fails
      return null;
    }
  };
import { useEffect, useState } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Container from "@mui/material/Container";
import AppAppBar from "./components/AppAppBar";
import MainContent from "./components/MainContent";
import Footer from "./components/Footer";
import AppTheme from "../shared-theme/AppTheme";
import { useAuthContext } from "../contexts/AuthContext";
import { apiAuthClient, apiClient } from "../utils/apiClients";
import { refreshToken } from "../utils/authUtils";

export default function Recipes(props: { disableCustomTheme?: boolean }) {
  const {
    isAuthenticated,
    setIsAuthenticated,
    menu,
    setRecipes,
    setMenus,
    setRecipeMenus,
  } = useAuthContext(); // Access setIsAuthenticated from context
  const [loadingAuth, setLoadingAuth] = useState(true); // Track authentication status check

  // Run this effect when I refresh the page to authenticate
  useEffect(() => {
    console.log("first effect");
    const checkAuthStatus = async () => {
      try {
        const token = sessionStorage.getItem("accessToken");
        const config = token
          ? {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          : {};


        const response = await apiClient.get("/auth/status", config);

        if (response.status === 200) {
          setIsAuthenticated(true); // User is authenticated
        } else {
          throw new Error("Authentication failed, attempting token refresh.");
        }
      } catch (error) {
        console.error(
          "Initial auth check failed, attempting token refresh:",
          error
        );

        // Attempt to refresh the token
        try {
          const newAccessToken = await refreshToken();
          if (newAccessToken) {
            // Retry the original request with the new token
            const retryResponse = await apiClient.get("/auth/status", {
              headers: {
                Authorization: `Bearer ${newAccessToken}`,
              },
            });

            if (retryResponse.status === 200) {
              setIsAuthenticated(true); // User is authenticated
            } else {
              setIsAuthenticated(false); // User is not authenticated
            }
          } else {
            setIsAuthenticated(false); // Token refresh failed
          }
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          setIsAuthenticated(false); // User is not authenticated
        }
      } finally {
        setLoadingAuth(false); // Mark authentication check as complete
      }
    };

    checkAuthStatus();
  }, [setIsAuthenticated]);

  useEffect(() => {
    if (!loadingAuth) {
      console.log("Fetching menus only once.");
      const fetchMenus = async () => {
        try {
          if (isAuthenticated) {
            const response = await apiAuthClient.get("/users/menus");
            setMenus(response.data.data);
          }
        } catch (error) {
          console.error("Error fetching menus:", error);
        }
      };

      fetchMenus();
    }
  }, [isAuthenticated, loadingAuth, setMenus]);

  useEffect(() => {
    if (!loadingAuth) {
      console.log("Fetching recipes.");
      const fetchRecipes = async () => {
        try {
          if (isAuthenticated) {
            if (menu === null) {
              const response = await apiClient.get("/recipes");
              setRecipes(response.data.data);
            } else if (menu === "") {
              console.log("menu is default.");
              const response = await apiAuthClient.get("/users/recipes");
              setRecipes(response.data.data);
            } else {
              const encodedMenu = encodeURIComponent(menu);
              const response = await apiAuthClient.get(
                `/users/${encodedMenu}/recipes`
              );

              setRecipes(response.data.data);
            }
          } else {
            const response = await apiClient.get("/recipes");
            setRecipes(response.data.data);
          }
        } catch (error) {
          console.error("Error fetching recipes:", error);
        }
      };

      fetchRecipes();
    }
  }, [isAuthenticated, loadingAuth, menu, setRecipes]); // Fetch recipes whenever menu changes

  useEffect(() => {
    if (!loadingAuth) {
      console.log("Fetching recipeMenus.");
      const fetchRecipeMenus = async () => {
        try {
          if (isAuthenticated) {
            const response = await apiAuthClient.get("/users/recipeMenus");
            const recipeMenusMap = new Map<string, string[]>(
              Object.entries(response.data.data)
            );
            setRecipeMenus(recipeMenusMap);
          }
        } catch (error) {
          console.error("Error fetching recipeMenus:", error);
        }
      };

      fetchRecipeMenus();
    }
  }, [isAuthenticated, loadingAuth, setRecipeMenus]);

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <AppAppBar />
      <Container
        maxWidth="lg"
        component="main"
        sx={{ display: "flex", flexDirection: "column", my: 16, gap: 4 }}
      >
        <MainContent />
      </Container>
      <Footer />
    </AppTheme>
  );
}

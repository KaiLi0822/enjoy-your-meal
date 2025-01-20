import React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Container from "@mui/material/Container";
import AppAppBar from "./components/AppAppBar";
import MainContent from "./components/MainContent";
import Footer from "./components/Footer";
import AppTheme from "../shared-theme/AppTheme";
import { useAuthContext } from "../contexts/AuthContext";
import { apiAuthClient, apiClient } from "../utils/apiClients";

export default function Recipes(props: { disableCustomTheme?: boolean }) {
  const { isAuthenticated, menu, setRecipes, setMenus } = useAuthContext(); // Access setIsAuthenticated from context
  React.useEffect(() => {
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
  }, [isAuthenticated, setMenus]); // Fetch menus only when isAuthenticated changes

  React.useEffect(() => {
    console.log("Fetching recipes.");
    const fetchRecipes = async () => {
      try {
        if (isAuthenticated) {
          if (menu === "") {
            console.log("menu is default.");
            const response = await apiAuthClient.get("/users/recipes");
            setRecipes(response.data.data);
          } else {
            const encodedMenu = encodeURIComponent(menu);
            console.log(`/users/${encodedMenu}/recipes`);
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
  }, [isAuthenticated, menu, setRecipes]); // Fetch recipes whenever menu changes

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

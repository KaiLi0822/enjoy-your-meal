import React, { createContext, useContext, useState } from "react";
import { Recipe } from "../types/recipe";
import { Menu } from "../types/menu";

// Define the context type
interface AuthContextProps {
  isAuthenticated: boolean, // Allow undefined state
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>,
  recipes: Recipe[],
  setRecipes: React.Dispatch<React.SetStateAction<Recipe[]>>,
  menu: string | null,
  setMenu: React.Dispatch<React.SetStateAction<string | null>>,
  menus: Menu[],
  setMenus: React.Dispatch<React.SetStateAction<Menu[]>>,
}

// Create the context
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Custom hook to access the context
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [menu, setMenu] = useState<string | null>("");
  const [menus, setMenus] = useState<Menu[]>([]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        recipes,
        setRecipes,
        menu,
        setMenu,
        menus,
        setMenus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

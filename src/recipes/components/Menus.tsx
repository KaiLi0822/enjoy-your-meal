import React, { useState } from "react";
import { Box, MenuItem, Select, IconButton, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { Menu } from "../../types/menu";
import {apiAuthClient} from "../../utils/apiClients";

export const Menus: React.FC = () => {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [selectedMenu, setSelectedMenu] = useState("recipes");
  const [isLoading, setIsLoading] = useState(false);

  const fetchMenus = async () => {
    try {
      const response = await apiAuthClient.get("/menus");
      if (response.status === 200) {
        setMenus(response.data.menus);
      } else {
        console.error("Failed to fetch menus");
      }
    } catch (error) {
      console.error("Error fetching menus:", error);
    }
  };

  const deleteMenu = async (menuId: string) => {
    try {
        const response = await apiAuthClient.delete(`/menus/${menuId}`); // DELETE request to /api/menus/:menuId
        if (response.status === 200) {
          setMenus((prev) => prev.filter((menu) => menu.SK !== menuId));
        } else {
          console.error("Failed to delete menu");
        }
      } catch (error) {
        console.error("Error deleting menu:", error);
        alert("Failed to delete the menu. Please try again.");
      }
  };

  const handleOpen = async () => {
    setIsLoading(true);
    try {
      await fetchMenus();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <Select
        value={selectedMenu}
        onChange={(event) => setSelectedMenu(event.target.value)}
        sx={{ minWidth: 100 }}
        onOpen={handleOpen}
      >
         <MenuItem key="recipes" value="recipes">
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography>
                recipes
              </Typography>
            </Box>
          </MenuItem>
        {isLoading ? (
          <MenuItem disabled>Loading...</MenuItem>
        ) : (
          menus.map((menu) => (
            <MenuItem key={menu.SK} value={menu.name}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography>{menu.name}</Typography>
                <IconButton
                  onClick={(event) => {
                    event.stopPropagation();
                    deleteMenu(menu.SK);
                  }}
                  color="error"
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </MenuItem>
          ))
        )}
      </Select>
    </Box>
  );
};

import React, { useState, MouseEvent } from "react";
import { Box, MenuItem, IconButton, Typography, Menu, Snackbar } from "@mui/material";
import { Menu as MenuType } from "../../types/menu";
import { useAuthContext } from "../../contexts/AuthContext";

export const Menus: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { menus, setMenu } = useAuthContext();
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const openMenu = Boolean(anchorEl);

  const handleOpenMenu = (event: MouseEvent<HTMLElement>) => {
    if (!menus || menus.length === 0) {
      setSnackbarOpen(true); // Trigger the Snackbar
      return;
    }
      setAnchorEl(event.currentTarget);
    
    
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const switchMenu = (menu: string) => {
    handleCloseMenu();
    setMenu(menu);
  };

  return (
    <>
        <Snackbar
      open={snackbarOpen}
      autoHideDuration={3000}
      onClose={() => setSnackbarOpen(false)}
      message="You don’t have any menus yet. Go to Profile -> Menus to create your first menu!"
      anchorOrigin={{
        vertical: "top", // Position vertically at the center
        horizontal: "center", // Position horizontally at the center
      }}
    />
    
    
    
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <IconButton onClick={handleOpenMenu}>
        <Typography>Menu</Typography>
      </IconButton>
      <Menu anchorEl={anchorEl} open={openMenu} onClose={handleCloseMenu}>
        {menus.map((menu: MenuType) => (
          <MenuItem key={menu.SK} onClick={() => switchMenu(menu.SK)}>
            <Typography>{menu.name}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </Box>
    </>
  );
};

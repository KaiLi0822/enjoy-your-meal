import React, { useState, MouseEvent } from "react";
import { Box, MenuItem, IconButton, Typography, Menu } from "@mui/material";
import { Menu as MenuType } from "../../types/menu";
import { useAuthContext } from "../../contexts/AuthContext";
import CenteredSnackbar from "./CenteredSnackbar";

const Menus: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { menus, setMenu } = useAuthContext();
  const [alertMessage, setAlertMessage] = useState("");

  const openMenu = Boolean(anchorEl);

  const handleOpenMenu = (event: MouseEvent<HTMLElement>) => {
    if (!menus || menus.length === 0) {
      setAlertMessage("You don’t have any menus yet. Go to your Profile -> Menus to get started!"); // Trigger the Snackbar
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
     <CenteredSnackbar
        message={alertMessage}
        onClose={() => setAlertMessage("")}
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


export default Menus;

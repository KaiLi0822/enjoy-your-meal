import React, { useState, MouseEvent } from "react";
import { Box, MenuItem, IconButton, Typography, Menu } from "@mui/material";
import { Menu as MenuType } from "../../types/menu";
import { useAuthContext } from "../../contexts/AuthContext";

export const Menus: React.FC = () => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const { menus, setMenu } = useAuthContext();
  
    const openMenu = Boolean(anchorEl);
  
    const handleOpenMenu = (event: MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
    };
  
    const handleCloseMenu = () => {
      setAnchorEl(null);
    };

    const switchMenu = (menu: string) => {
        setMenu(menu);
        handleCloseMenu();
    }
  
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <IconButton onClick={handleOpenMenu}>
          <Typography>Menu</Typography>
        </IconButton>
        <Menu anchorEl={anchorEl} open={openMenu} onClose={handleCloseMenu}>
        <MenuItem key="default" onClick={() => switchMenu("")}>
              <Typography>default</Typography>
            </MenuItem>
          {menus.map((menu: MenuType) => (
            <MenuItem key={menu.SK} onClick={() => switchMenu(menu.SK)}>
              <Typography>{menu.name}</Typography>
            </MenuItem>
          ))}
        </Menu>
      </Box>
    );
  
};

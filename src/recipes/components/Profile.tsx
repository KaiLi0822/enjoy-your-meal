import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Menu,
  MenuItem,
  TextField,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import { useAuthContext } from "../../contexts/AuthContext";
import { useState, MouseEvent } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { apiAuthClient, apiClient } from "../../utils/apiClients";
import CenteredSnackbar from "./CenteredSnackbar";

const Profile = () => {
  const { setIsAuthenticated, menus, setMenus, setMenu } = useAuthContext();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isMenuOpen, setMenuOpen] = useState<boolean>(false);
  const [tempMenus, setTempMenus] = useState<string[]>([]);
  const [newMenuItem, setNewMenuItem] = useState<string>("");
  const [alertMessage, setAlertMessage] = useState("");

  const openMenu = Boolean(anchorEl);

  const handleOpenMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleOpenMenusDialog = () => {
    handleCloseMenu();
    // load menus' name into tempMenus
    const menuNames = menus.map((menuItem) => {
      return menuItem.name;
    });
    setTempMenus(menuNames);
    setMenuOpen(true);
  };

  const handleAddMenuItem = () => {
    if (newMenuItem.trim()) {
      if (tempMenus.includes(newMenuItem)) {
        setAlertMessage("Menu name already exists.");
        return;
      }
      setTempMenus((prevMenus) => [...prevMenus, newMenuItem.trim()]);
      setNewMenuItem("");
    }
  };

  const handleRemoveMenuItem = (index: number) => {
    setTempMenus((prevMenus) => prevMenus.filter((_, i) => i !== index));
  };

  const handleSaveMenus = async () => {
    const existingMenuNames = menus.map((menuItem) => menuItem.name);
    // compare the menus and tempMenus
    // for menu included in the munus does not exist in the tempMenus, update database(remove menus)
    const menusToDelete = existingMenuNames.filter(
      (menuName) => !tempMenus.includes(menuName)
    );
    for (const menuName of menusToDelete) {
      await apiAuthClient.delete(`/users/menus/${menuName}`);
    }

    // for menu included in the tempMenus does not exist in the menus, update database(add menus)
    const menusToAdd = tempMenus.filter(
      (menuName) => !existingMenuNames.includes(menuName)
    );

    for (const menuName of menusToAdd) {
      await apiAuthClient.post(`/users/menus/${menuName}`);
    }
    // update menus context
    const response = await apiAuthClient.get("/users/menus");
    setMenus(response.data.data);
    setMenu("");
    setNewMenuItem("")
    setMenuOpen(false);
  };

  const handleCancel = () => {
    setNewMenuItem("")
    setMenuOpen(false);
  };

  const onLogout = async () => {
    try {
      await apiClient.post(
        "/auth/logout",
        {},
        {
          withCredentials: true, // Ensure cookies are included in the request
        }
      );
      sessionStorage.clear(); // Clear token
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <>
      <CenteredSnackbar
        message={alertMessage}
        onClose={() => setAlertMessage("")}
      />
      <IconButton onClick={handleOpenMenu}>
        <PersonIcon sx={{ color: "primary.main" }} />
      </IconButton>
      <Menu anchorEl={anchorEl} open={openMenu} onClose={handleCloseMenu}>
        <MenuItem onClick={handleOpenMenusDialog}>Menus</MenuItem>
        <MenuItem onClick={onLogout}>Log out</MenuItem>
      </Menu>

      <Dialog open={isMenuOpen} onClose={handleCancel} fullWidth disableRestoreFocus>
        <DialogTitle>Manage Menus</DialogTitle>
        <DialogContent>
          <List>
            {tempMenus.map((menu, index) => (
              <ListItem
                key={index}
                secondaryAction={
                  <IconButton
                    edge="end"
                    onClick={() => handleRemoveMenuItem(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText primary={menu} />
              </ListItem>
            ))}
          </List>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2 }}>
            <TextField
              fullWidth
              size="small"
              value={newMenuItem}
              onChange={(e) => setNewMenuItem(e.target.value)}
              placeholder="Add new menu"
            />
            <IconButton color="primary" onClick={handleAddMenuItem}>
              <AddIcon />
            </IconButton>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSaveMenus} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Profile;

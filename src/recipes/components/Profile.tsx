import { Box, MenuItem, Select } from "@mui/material";
import { useNavigate } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";
import axios from "axios";

export const Profile = () => {
  const navigate = useNavigate();

  const onLogout = async () => {
    try {
      await axios.post(
        "/api/auth/logout",
        {},
        {
          withCredentials: true, // Ensure cookies are included in the request
        }
      );
      sessionStorage.clear(); // Clear token
      navigate("/", { state: { auth: false } });
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <Select
      value=""
      onChange={(event) => {
        if (event.target.value === "logout") {
          onLogout();
        }
      }}
      displayEmpty
      renderValue={() => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 20,
              height: 20,
              display: "flex",
              alignItems: "center",
            }}
          >
            <PersonIcon sx={{ color: "primary.main" }} />
          </Box>
        </Box>
      )}
      sx={{
        minWidth: 0,
        borderRadius: 2,
      }}
    >
      <MenuItem value="logout">Log out</MenuItem>
    </Select>
  );
};

import React from 'react';
import { Box, MenuItem, Select } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface ProfileProps {
  userName: string;
  onLogout: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ userName, onLogout }) => {
  const navigate = useNavigate();

  return (
    <Select
      value=""
      onChange={(event) => {
        if (event.target.value === 'logout') {
          onLogout();
          navigate('/');
        }
      }}
      displayEmpty
      renderValue={() => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {userName.charAt(0).toUpperCase()}
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

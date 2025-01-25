import React from "react";
import Snackbar from "@mui/material/Snackbar";

interface CenteredSnackbarProps {
  message: string;
  onClose: () => void;
}

const CenteredSnackbar: React.FC<CenteredSnackbarProps> = ({
  message,
  onClose,
}) => {
  return (
    <Snackbar
      open={message !== ""}
      autoHideDuration={3000}
      onClose={onClose}
      message={message}
      anchorOrigin={{
        vertical: "top", // Center vertically
        horizontal: "center", // Center horizontally
      }}
    />
  );
};

export default CenteredSnackbar;

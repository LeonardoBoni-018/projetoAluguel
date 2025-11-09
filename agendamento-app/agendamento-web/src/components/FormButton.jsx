import React from 'react';
import { Button } from '@mui/material';

export default function FormButton({ children, onClick, type = 'button', disabled, variant = 'contained', color = 'primary', startIcon, fullWidth, size = 'medium', sx = {} }) {
  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={disabled}
      variant={variant}
      color={color}
      startIcon={startIcon}
      fullWidth={fullWidth}
      size={size}
      sx={sx}
    >
      {children}
    </Button>
  );
}

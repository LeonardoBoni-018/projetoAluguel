import React from 'react';
import { Card as MuiCard, CardContent, Typography } from '@mui/material';

export default function Card({ title, children, elevation = 2, sx = {} }) {
  return (
    <MuiCard elevation={elevation} sx={{ height: '100%', ...sx }}>
      <CardContent>
        {title && (
          <Typography variant="h6" color="primary" gutterBottom>
            {title}
          </Typography>
        )}
        {children}
      </CardContent>
    </MuiCard>
  );
}

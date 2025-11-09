import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import Router from './router/Router';
import { theme } from './theme';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router />
    </ThemeProvider>
  );
}

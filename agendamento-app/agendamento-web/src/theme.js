import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#2d7be4',
      light: '#5493e8',
      dark: '#1f569f',
    },
    secondary: {
      main: '#e74c3c',
      light: '#eb6b5e',
      dark: '#a1352a',
    },
    background: {
      default: '#f5f7fb',
      paper: '#ffffff',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
        },
      },
    },
  },
});
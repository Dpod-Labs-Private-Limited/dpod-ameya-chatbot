import { createTheme } from '@mui/material/styles';

const defaultTheme = createTheme({
  title: 'Ameya Chatbot',

  palette: {
    primary: {
      main: '#EEEEEE',
      light: '#F3F5F7',
      dark: "#1F1E1E"
    },
    secondary: {
      main: '#FFFFFF',
      dark: '#000000'
    },
    action: {
      active: "#000000",
      hover: '#666666',
      focus: '#DEDEDE',
    },
    text: {
      primary: "#FFFFFF",
      secondary: '#FFFFFF'
    }
  },
  typography: {
    fontFamily: 'Inter' || 'Arial, sans-serif',

    h1: {
      fontSize: '20px',
      fontWeight: 600,
      color: '#000000'
    },
    h2: {
      fontSize: '14px',
      fontWeight: 600,
      color: '#000000'
    },
    h3: {
      fontSize: '16px',
      fontWeight: 600,
      color: '#000000'
    },
    h4: {
      fontSize: '16px',
      fontWeight: 400,
      color: '#000000'
    },
    h5: {
      fontSize: '14px',
      fontWeight: 600,
      color: '#000000'
    },
    h6: {
      fontSize: '12px',
      fontWeight: 400,
    },
    body1: {
      fontSize: '15px',
      fontWeight: 400,
      color: '#000000'
    },
    body2: {
      fontSize: '12px',
      fontWeight: 400,
      color: '#000000'
    },
    primaryButton: {
      fontSize: '16px',
      fontWeight: 600,
      textTransform: 'none',
    },
    secondaryButton: {
      fontSize: '15px',
      fontWeight: 600,
      textTransform: 'none',
    }
  },
});

export default defaultTheme;

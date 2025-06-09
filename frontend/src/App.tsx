import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container, ThemeProvider, createTheme } from '@mui/material';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Products from './components/Products';
import Cart from './components/Cart';
import ProductDetail from './components/ProductDetail';
import Auth from './components/Auth';
import Profile from './pages/Profile';
import { AuthProvider } from './context/AuthContext';

// Создаем черно-желтую тему
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#FFD700', // Золотой желтый
      light: '#FFE55C',
      dark: '#FFC107',
      contrastText: '#000000',
    },
    secondary: {
      main: '#FFEB3B', // Яркий желтый
      light: '#FFF176',
      dark: '#FBC02D',
      contrastText: '#000000',
    },
    background: {
      default: '#121212', // Темно-серый фон
      paper: '#1E1E1E', // Чуть светлее для карточек
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#FFD700',
    },
    action: {
      active: '#FFD700',
      hover: '#FFE55C',
    },
  },
  typography: {
    h1: {
      color: '#FFD700',
    },
    h2: {
      color: '#FFD700',
    },
    h3: {
      color: '#FFD700',
    },
    h4: {
      color: '#FFD700',
    },
    h5: {
      color: '#FFD700',
    },
    h6: {
      color: '#FFD700',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1E1E1E',
          border: '1px solid #333333',
          '&:hover': {
            border: '1px solid #FFD700',
            boxShadow: '0 4px 20px rgba(255, 215, 0, 0.3)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 'bold',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Router>
          <Navbar />
          <Container sx={{ mt: 4 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/categories" element={<Products />} />
            </Routes>
          </Container>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 
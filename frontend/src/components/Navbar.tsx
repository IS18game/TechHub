import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, Menu, MenuItem, IconButton, Badge } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import HomeIcon from '@mui/icons-material/Home';
import CategoryIcon from '@mui/icons-material/Category';
import LoginIcon from '@mui/icons-material/Login';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, Person } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const navigate = useNavigate();

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
    navigate('/');
  };

  return (
    <AppBar 
      position="static" 
      sx={{ 
        background: 'linear-gradient(45deg, #000000 30%, #1a1a1a 90%)',
        borderBottom: '2px solid #FFD700',
        boxShadow: '0 4px 20px rgba(255, 215, 0, 0.3)',
      }}
    >
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: '#FFD700',
            display: 'flex',
            alignItems: 'center',
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            '&:hover': {
              color: '#FFE55C',
            },
          }}
        >
          TechHub
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            color="inherit"
            component={Link}
            to="/"
            startIcon={<HomeIcon />}
            sx={{
              color: '#FFD700',
              '&:hover': {
                backgroundColor: 'rgba(255, 215, 0, 0.1)',
                color: '#FFE55C',
              },
            }}
          >
            Главная
          </Button>
          <Button
            color="inherit"
            component={Link}
            to="/categories"
            startIcon={<CategoryIcon />}
            sx={{
              color: '#FFD700',
              '&:hover': {
                backgroundColor: 'rgba(255, 215, 0, 0.1)',
                color: '#FFE55C',
              },
            }}
          >
            Категории
          </Button>
          <Button
            color="inherit"
            component={Link}
            to="/cart"
            startIcon={
              <Badge badgeContent={0} color="error">
                <ShoppingCart />
              </Badge>
            }
            sx={{
              color: '#FFD700',
              '&:hover': {
                backgroundColor: 'rgba(255, 215, 0, 0.1)',
                color: '#FFE55C',
              },
            }}
          >
            Корзина
          </Button>
          {isAuthenticated ? (
            <>
              <Button
                color="inherit"
                component={Link}
                to="/profile"
                startIcon={<Person />}
                sx={{
                  color: '#FFD700',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 215, 0, 0.1)',
                    color: '#FFE55C',
                  },
                }}
              >
                {user?.username || 'Профиль'}
              </Button>
              <Button 
                color="inherit" 
                onClick={handleLogout}
                sx={{
                  color: '#FFD700',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 215, 0, 0.1)',
                    color: '#FFE55C',
                  },
                }}
              >
                Выйти
              </Button>
            </>
          ) : (
            <Button
              color="inherit"
              component={Link}
              to="/auth"
              startIcon={<LoginIcon />}
              sx={{
                color: '#FFD700',
                '&:hover': {
                  backgroundColor: 'rgba(255, 215, 0, 0.1)',
                  color: '#FFE55C',
                },
              }}
            >
              Войти
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 
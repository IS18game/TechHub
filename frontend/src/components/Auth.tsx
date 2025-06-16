import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Tab,
  Tabs,
  Alert,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Auth: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const [registerData, setRegisterData] = useState({
    email: '',
    username: '',
    password: '',
  });

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError(null);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Attempting to register with data:', { ...registerData, password: '***' });
      console.log('API URL:', `${API_URL}/api/v1/auth/register`);
      
      const response = await axios.post(`${API_URL}/api/v1/auth/register`, registerData);
      console.log('Response data:', response.data);
      
      // После успешной регистрации переключаемся на вкладку входа
      setTabValue(1);
      setError(null);
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.response?.data?.detail || 'Ошибка при регистрации');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Attempting to login with email:', loginData.email);
      console.log('API URL:', `${API_URL}/api/v1/auth/login`);
      
      // Создаем FormData для отправки данных в формате application/x-www-form-urlencoded
      const formData = new URLSearchParams();
      formData.append('username', loginData.email);
      formData.append('password', loginData.password);
      
      const response = await axios.post(`${API_URL}/api/v1/auth/login`, formData.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      console.log('Response data:', response.data);
      
      login(response.data.access_token);
      navigate('/');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.detail || 'Ошибка при входе');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ mt: 8, mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Регистрация" />
          <Tab label="Вход" />
        </Tabs>

        {error && (
          <Alert severity="error" sx={{ mt: 2, mx: 2 }}>
            {error}
          </Alert>
        )}

        <TabPanel value={tabValue} index={0}>
          <Box component="form" onSubmit={handleRegister} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              autoFocus
              value={registerData.email}
              onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Имя пользователя"
              name="username"
              autoComplete="username"
              value={registerData.username}
              onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Пароль"
              type="password"
              id="password"
              autoComplete="new-password"
              value={registerData.password}
              onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Зарегистрироваться
            </Button>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box component="form" onSubmit={handleLogin} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              autoFocus
              value={loginData.email}
              onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Пароль"
              type="password"
              id="password"
              autoComplete="current-password"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Войти
            </Button>
          </Box>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default Auth; 
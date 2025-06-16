import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Box,
  IconButton,
  TextField,
  Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8002';

interface CartItem {
  id: number;
  product: {
    id: number;
    name: string;
    price: number;
    image_url: string;
  };
  quantity: number;
}

const Cart: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/auth';
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/api/v1/cart/items`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setCartItems(response.data);
      calculateTotal(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setError('Ошибка при загрузке корзины');
    }
  };

  const calculateTotal = (items: CartItem[]) => {
    const sum = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    setTotal(sum);
  };

  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await axios.put(
        `${API_URL}/api/v1/cart/items/${itemId}`,
        { quantity: newQuantity },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const updatedItems = cartItems.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      );
      setCartItems(updatedItems);
      calculateTotal(updatedItems);
      setError(null);
    } catch (error) {
      console.error('Error updating quantity:', error);
      setError('Ошибка при обновлении количества');
    }
  };

  const removeItem = async (itemId: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await axios.delete(`${API_URL}/api/v1/cart/items/${itemId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const updatedItems = cartItems.filter(item => item.id !== itemId);
      setCartItems(updatedItems);
      calculateTotal(updatedItems);
      setError(null);
    } catch (error) {
      console.error('Error removing item:', error);
      setError('Ошибка при удалении товара');
    }
  };

  if (cartItems.length === 0) {
    return (
      <Container>
        <Typography variant="h4" component="h1" gutterBottom>
          Корзина пуста
        </Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Корзина
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {cartItems.map((item) => (
            <Card key={item.id} sx={{ mb: 2 }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={3}>
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      style={{ width: '100%', height: 'auto', maxHeight: '150px', objectFit: 'contain' }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="h6">{item.product.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      ₽{item.product.price.toFixed(2)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                      inputProps={{ min: 1 }}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <IconButton
                      color="error"
                      onClick={() => removeItem(item.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Итого
              </Typography>
              <Typography variant="h4" color="primary" gutterBottom>
                ₽{total.toFixed(2)}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
              >
                Оформить заказ
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Cart; 
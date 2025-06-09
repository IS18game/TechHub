import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Button,
  Box,
  Rating,
  Card,
  CardMedia,
} from '@mui/material';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  rating: number;
  image_url: string;
  category_id: number;
  stock: number;
  reviews_count: number;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  user: {
    username: string;
  };
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/products/${id}`);
        if (response.ok) {
          const data = await response.json();
          setProduct(data);
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        navigate('/');
      }
    };

    const fetchReviews = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/reviews/product/${id}`);
        if (response.ok) {
          const data = await response.json();
          setReviews(data);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };

    fetchProduct();
    fetchReviews();
  }, [id, navigate]);

  const handleAddToCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/auth';
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/cart/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: product?.id,
          quantity: 1,
        }),
      });

      if (response.ok) {
        alert('Товар добавлен в корзину!');
      } else {
        const error = await response.json();
        alert(error.detail || 'Ошибка при добавлении товара в корзину');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Ошибка при добавлении товара в корзину');
    }
  };

  const handleReviewSubmitted = () => {
    // Перезагружаем отзывы и информацию о товаре
    const fetchReviews = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/reviews/product/${id}`);
        if (response.ok) {
          const data = await response.json();
          setReviews(data);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };

    const fetchProduct = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/products/${id}`);
        if (response.ok) {
          const data = await response.json();
          setProduct(data);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };

    fetchReviews();
    fetchProduct();
  };

  if (!product) {
    return (
      <Container>
        <Typography>Загрузка...</Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardMedia
              component="img"
              image={product.image_url}
              alt={product.name}
              sx={{ height: 'auto', maxHeight: 500 }}
            />
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#FFD700', textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
            {product.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Rating 
              value={product.rating} 
              precision={0.5} 
              readOnly 
              sx={{
                '& .MuiRating-iconFilled': {
                  color: '#FFD700',
                },
                '& .MuiRating-iconHover': {
                  color: '#FFE55C',
                },
              }}
            />
            <Typography variant="body2" sx={{ ml: 1, color: '#FFD700' }}>
              ({product.rating}) • {product.reviews_count} {product.reviews_count === 1 ? 'отзыв' : product.reviews_count < 5 ? 'отзыва' : 'отзывов'}
            </Typography>
          </Box>
          <Typography variant="h5" gutterBottom sx={{ 
            color: '#FFD700', 
            fontWeight: 'bold',
            textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
          }}>
            ₽{product.price.toFixed(2)}
          </Typography>
          <Typography variant="body1" paragraph sx={{ 
            color: '#FFE55C',
            lineHeight: 1.6,
            textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
          }}>
            {product.description}
          </Typography>
          <Typography variant="body2" gutterBottom sx={{ 
            color: product.stock > 0 ? '#4CAF50' : '#FF6B6B',
            fontWeight: 'bold',
            textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
          }}>
            {product.stock > 0 ? `В наличии: ${product.stock} шт.` : 'Нет в наличии'}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            sx={{ 
              mt: 2,
              background: 'linear-gradient(45deg, #FFD700 30%, #FFE55C 90%)',
              color: '#000000',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              padding: '12px 32px',
              boxShadow: '0 4px 20px rgba(255, 215, 0, 0.4)',
              '&:hover': {
                background: 'linear-gradient(45deg, #FFE55C 30%, #FFD700 90%)',
                boxShadow: '0 6px 25px rgba(255, 215, 0, 0.6)',
                transform: 'translateY(-2px)',
              },
              '&:disabled': {
                background: '#666666',
                color: '#999999',
                boxShadow: 'none',
              },
            }}
          >
            {product.stock === 0 ? 'Нет в наличии' : 'Добавить в корзину'}
          </Button>
        </Grid>
      </Grid>

      {/* Reviews Section */}
      <Box sx={{ mt: 6 }}>
        <ReviewForm productId={product.id} onReviewSubmitted={handleReviewSubmitted} />
        <ReviewList reviews={reviews} />
      </Box>
    </Container>
  );
};

export default ProductDetail; 
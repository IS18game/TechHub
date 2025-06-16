import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Box,
  Rating,
} from '@mui/material';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8002';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  rating: number;
  image_url: string;
  reviews_count: number;
}

interface Category {
  id: number;
  name: string;
  description: string;
}

const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching data from:', `${API_URL}/api/v1/categories`);
        const [productsResponse, categoriesResponse] = await Promise.all([
          axios.get(`${API_URL}/api/v1/products`),
          axios.get(`${API_URL}/api/v1/categories`),
        ]);

        console.log('Categories response:', categoriesResponse.data);
        // Get top 3 products by rating
        const sortedProducts = productsResponse.data
          .sort((a: Product, b: Product) => b.rating - a.rating)
          .slice(0, 3);
        console.log('Featured products with ratings:', sortedProducts.map((p: Product) => ({ name: p.name, rating: p.rating, reviews_count: p.reviews_count })));
        setFeaturedProducts(sortedProducts);
        setCategories(categoriesResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <Container maxWidth="lg">
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)',
          color: 'white',
          py: 8,
          px: 4,
          borderRadius: 2,
          mb: 6,
          textAlign: 'center',
          border: '2px solid #FFD700',
          boxShadow: '0 8px 32px rgba(255, 215, 0, 0.3)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(45deg, transparent 30%, rgba(255, 215, 0, 0.1) 50%, transparent 70%)',
            animation: 'shimmer 3s infinite',
          },
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom sx={{ color: '#FFD700', textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
          Добро пожаловать в TechHub
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#FFE55C', textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
          Ваш универсальный магазин для всех компьютерных компонентов
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => navigate('/products')}
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
          }}
        >
          Купить сейчас
        </Button>
      </Box>

      {/* Featured Products */}
      <Typography variant="h4" gutterBottom sx={{ 
        color: '#FFD700',
        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
        borderBottom: '2px solid #FFD700',
        paddingBottom: 1,
      }}>
        Рекомендуемые товары
      </Typography>
      <Grid container spacing={4} sx={{ mb: 6 }}>
        {featuredProducts.map((product) => (
          <Grid item key={product.id} xs={12} md={4}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={product.image_url || `https://source.unsplash.com/random/400x300?computer,${product.name}`}
                alt={product.name}
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {product.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Rating 
                    value={product.rating || 0} 
                    readOnly 
                    precision={0.5} 
                    size="small" 
                    sx={{
                      '& .MuiRating-iconFilled': {
                        color: '#FFD700',
                      },
                      '& .MuiRating-iconHover': {
                        color: '#FFE55C',
                      },
                    }}
                  />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    ({product.rating || 0}) • {product.reviews_count || 0} {product.reviews_count === 1 ? 'отзыв' : (product.reviews_count || 0) < 5 ? 'отзыва' : 'отзывов'}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {product.description}
                </Typography>
                <Typography variant="h6" color="primary" sx={{ 
                  mt: 2,
                  color: '#FFD700',
                  fontWeight: 'bold',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                }}>
                  ₽{product.price.toFixed(2)}
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => navigate(`/product/${product.id}`)}
                  sx={{ 
                    mt: 2,
                    borderColor: '#FFD700',
                    color: '#FFD700',
                    '&:hover': {
                      borderColor: '#FFE55C',
                      backgroundColor: 'rgba(255, 215, 0, 0.1)',
                      color: '#FFE55C',
                    },
                  }}
                >
                  Подробнее
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Categories */}
      <Typography variant="h4" gutterBottom sx={{ 
        color: '#FFD700',
        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
        borderBottom: '2px solid #FFD700',
        paddingBottom: 1,
      }}>
        Категории
      </Typography>
      <Grid container spacing={4}>
        {categories.map((category) => (
          <Grid item key={category.id} xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {category.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {category.description}
                </Typography>
                <Button
                  variant="text"
                  onClick={() => navigate(`/products?category=${category.id}`)}
                  sx={{ 
                    mt: 2,
                    color: '#FFD700',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 215, 0, 0.1)',
                      color: '#FFE55C',
                    },
                  }}
                >
                  Просмотреть категорию
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Home; 
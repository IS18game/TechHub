import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Rating,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
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
  category_id: number;
  stock: number;
  reviews_count: number;
}

interface Category {
  id: number;
  name: string;
}

const Products: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log('Fetching categories from:', `${API_URL}/api/v1/categories`);
        const response = await axios.get(`${API_URL}/api/v1/categories`);
        console.log('Categories response:', response.data);
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const url = selectedCategory
          ? `${API_URL}/api/v1/products?category_id=${selectedCategory}`
          : `${API_URL}/api/v1/products`;
        
        console.log('Fetching products from:', url);
        const response = await axios.get(url);
        console.log('Products response:', response.data);
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  const handleCategoryChange = (event: SelectChangeEvent) => {
    setSelectedCategory(event.target.value);
  };

  const handleProductClick = (productId: number) => {
    navigate(`/product/${productId}`);
  };

  return (
    <Container>
      <Box sx={{ mb: 4 }}>
        <FormControl fullWidth>
          <InputLabel id="category-select-label">Категория</InputLabel>
          <Select
            labelId="category-select-label"
            id="category-select"
            value={selectedCategory}
            label="Категория"
            onChange={handleCategoryChange}
          >
            <MenuItem value="">Все категории</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={4}>
        {products.map((product) => (
          <Grid item key={product.id} xs={12} sm={6} md={4}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'scale(1.02)',
                  transition: 'transform 0.2s ease-in-out',
                },
              }}
              onClick={() => handleProductClick(product.id)}
            >
              <CardMedia
                component="img"
                height="200"
                image={product.image_url}
                alt={product.name}
                sx={{ objectFit: 'contain', p: 2 }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="h2">
                  {product.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Rating 
                    value={product.rating} 
                    precision={0.5} 
                    readOnly 
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
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    ({product.rating}) • {product.reviews_count} {product.reviews_count === 1 ? 'отзыв' : product.reviews_count < 5 ? 'отзыва' : 'отзывов'}
                  </Typography>
                </Box>
                <Typography variant="h6" color="primary" gutterBottom>
                  ₽{product.price.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {product.description.length > 100
                    ? `${product.description.substring(0, 100)}...`
                    : product.description}
                </Typography>
                <Typography 
                  variant="body2" 
                  color={product.stock > 0 ? 'success.main' : 'error.main'}
                  sx={{ mt: 1 }}
                >
                  {product.stock > 0 ? `В наличии: ${product.stock} шт.` : 'Нет в наличии'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Products; 
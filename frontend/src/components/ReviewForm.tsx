import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Rating,
  Paper,
  Alert,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

interface ReviewFormProps {
  productId: number;
  onReviewSubmitted: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ productId, onReviewSubmitted }) => {
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rating) {
      setError('Пожалуйста, поставьте оценку');
      return;
    }
    
    if (!comment.trim()) {
      setError('Пожалуйста, напишите комментарий');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/reviews/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: productId,
          rating: rating,
          comment: comment.trim(),
        }),
      });

      if (response.ok) {
        setSuccess('Отзыв успешно добавлен!');
        setRating(null);
        setComment('');
        onReviewSubmitted();
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Ошибка при добавлении отзыва');
      }
    } catch (error) {
      setError('Ошибка при отправке отзыва');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)', border: '1px solid #FFD700' }}>
        <Typography variant="h6" sx={{ color: '#FFD700', mb: 2 }}>
          Оставить отзыв
        </Typography>
        <Typography sx={{ color: '#FFE55C' }}>
          Войдите в аккаунт, чтобы оставить отзыв
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)', border: '1px solid #FFD700' }}>
      <Typography variant="h6" sx={{ color: '#FFD700', mb: 2, textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
        Оставить отзыв
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Box sx={{ mb: 2 }}>
          <Typography component="legend" sx={{ color: '#FFE55C', mb: 1 }}>
            Ваша оценка:
          </Typography>
          <Rating
            value={rating}
            onChange={(event, newValue) => {
              setRating(newValue);
            }}
            size="large"
            sx={{
              '& .MuiRating-iconFilled': {
                color: '#FFD700',
              },
              '& .MuiRating-iconHover': {
                color: '#FFE55C',
              },
            }}
          />
        </Box>

        <TextField
          fullWidth
          multiline
          rows={4}
          label="Ваш комментарий"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#FFD700',
              },
              '&:hover fieldset': {
                borderColor: '#FFE55C',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#FFD700',
              },
            },
            '& .MuiInputLabel-root': {
              color: '#FFE55C',
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#FFD700',
            },
            '& .MuiInputBase-input': {
              color: '#FFE55C',
            },
          }}
        />

        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting}
          sx={{
            background: 'linear-gradient(45deg, #FFD700 30%, #FFE55C 90%)',
            color: '#000000',
            fontWeight: 'bold',
            '&:hover': {
              background: 'linear-gradient(45deg, #FFE55C 30%, #FFD700 90%)',
            },
            '&:disabled': {
              background: '#666666',
              color: '#999999',
            },
          }}
        >
          {isSubmitting ? 'Отправка...' : 'Отправить отзыв'}
        </Button>
      </Box>
    </Paper>
  );
};

export default ReviewForm; 
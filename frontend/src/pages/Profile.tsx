import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Avatar,
  Grid,
  Card,
  CardContent,
  Rating,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface Review {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  product: {
    id: number;
    name: string;
    image_url: string;
  };
}

const Profile: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [editRating, setEditRating] = useState<number | null>(null);
  const [editComment, setEditComment] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  console.log('Profile component - user data:', user);
  console.log('Profile component - isAuthenticated:', isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    fetchUserReviews();
  }, [isAuthenticated, navigate]);

  const fetchUserReviews = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/reviews/user/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (error) {
      console.error('Error fetching user reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditReview = (review: Review) => {
    setSelectedReview(review);
    setEditRating(review.rating);
    setEditComment(review.comment);
    setEditDialogOpen(true);
    setError('');
    setSuccess('');
  };

  const handleUpdateReview = async () => {
    if (!selectedReview || !editRating || !editComment.trim()) {
      setError('Пожалуйста, заполните все поля');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/reviews/${selectedReview.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: editRating,
          comment: editComment.trim(),
        }),
      });

      if (response.ok) {
        setSuccess('Отзыв успешно обновлен!');
        fetchUserReviews();
        setTimeout(() => {
          setEditDialogOpen(false);
          setSuccess('');
        }, 1500);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Ошибка при обновлении отзыва');
      }
    } catch (error) {
      setError('Ошибка при обновлении отзыва');
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот отзыв?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setSuccess('Отзыв успешно удален!');
        fetchUserReviews();
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Ошибка при удалении отзыва');
      }
    } catch (error) {
      setError('Ошибка при удалении отзыва');
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <Container>
        <Typography sx={{ color: '#FFD700' }}>Загрузка...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      {/* User Info */}
      <Paper sx={{ p: 4, mb: 4, background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)', border: '2px solid #FFD700' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: '#FFD700',
              color: '#000000',
              fontSize: '2rem',
              fontWeight: 'bold',
              mr: 2,
            }}
          >
            {user?.username?.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ color: '#FFD700', fontWeight: 'bold', textShadow: '2px 2px 4px rgba(0,0,0,0.8)', ml: 2 }}>
              {user?.username}
            </Typography>
            <Typography variant="subtitle1" sx={{ color: '#fff', ml: 2, opacity: 0.8 }}>
              {user?.email}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Reviews Section */}
      <Typography variant="h5" sx={{ color: '#FFD700', mb: 3, textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
        Мои отзывы ({reviews.length})
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

      {reviews.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)', border: '1px solid #FFD700' }}>
          <Typography sx={{ color: '#FFE55C' }}>
            У вас пока нет отзывов. Оставьте свой первый отзыв!
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {reviews.map((review) => (
            <Grid item xs={12} key={review.id}>
              <Card sx={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)', border: '1px solid #FFD700' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <img
                      src={review.product.image_url}
                      alt={review.product.name}
                      style={{
                        width: 80,
                        height: 80,
                        objectFit: 'cover',
                        borderRadius: 8,
                      }}
                    />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ color: '#FFD700', fontWeight: 'bold', mb: 1 }}>
                        {review.product.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Rating
                          value={review.rating}
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
                        <Typography variant="body2" sx={{ ml: 1, color: '#FFE55C' }}>
                          {format(new Date(review.created_at), 'dd MMMM yyyy')}
                        </Typography>
                      </Box>
                      <Typography variant="body1" sx={{ color: '#FFE55C', mb: 2 }}>
                        {review.comment}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleEditReview(review)}
                          sx={{
                            borderColor: '#FFD700',
                            color: '#FFD700',
                            '&:hover': {
                              borderColor: '#FFE55C',
                              backgroundColor: 'rgba(255, 215, 0, 0.1)',
                              color: '#FFE55C',
                            },
                          }}
                        >
                          Редактировать
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleDeleteReview(review.id)}
                          sx={{
                            borderColor: '#FF6B6B',
                            color: '#FF6B6B',
                            '&:hover': {
                              borderColor: '#FF5252',
                              backgroundColor: 'rgba(255, 107, 107, 0.1)',
                              color: '#FF5252',
                            },
                          }}
                        >
                          Удалить
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Edit Review Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: '#FFD700', background: '#1a1a1a' }}>
          Редактировать отзыв
        </DialogTitle>
        <DialogContent sx={{ background: '#1a1a1a' }}>
          <Box sx={{ mt: 2 }}>
            <Typography component="legend" sx={{ color: '#FFE55C', mb: 1 }}>
              Ваша оценка:
            </Typography>
            <Rating
              value={editRating}
              onChange={(event, newValue) => {
                setEditRating(newValue);
              }}
              size="large"
              sx={{
                mb: 2,
                '& .MuiRating-iconFilled': {
                  color: '#FFD700',
                },
                '& .MuiRating-iconHover': {
                  color: '#FFE55C',
                },
              }}
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Ваш комментарий"
              value={editComment}
              onChange={(e) => setEditComment(e.target.value)}
              sx={{
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
          </Box>
        </DialogContent>
        <DialogActions sx={{ background: '#1a1a1a' }}>
          <Button
            onClick={() => setEditDialogOpen(false)}
            sx={{ color: '#FFE55C' }}
          >
            Отмена
          </Button>
          <Button
            onClick={handleUpdateReview}
            variant="contained"
            sx={{
              background: 'linear-gradient(45deg, #FFD700 30%, #FFE55C 90%)',
              color: '#000000',
              fontWeight: 'bold',
              '&:hover': {
                background: 'linear-gradient(45deg, #FFE55C 30%, #FFD700 90%)',
              },
            }}
          >
            Обновить
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile; 
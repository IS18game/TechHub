import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Rating,
  Avatar,
  Divider,
} from '@mui/material';
import { format } from 'date-fns';

interface Review {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  user: {
    username: string;
  };
}

interface ReviewListProps {
  reviews: Review[];
}

const ReviewList: React.FC<ReviewListProps> = ({ reviews }) => {
  if (reviews.length === 0) {
    return (
      <Paper sx={{ p: 3, background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)', border: '1px solid #FFD700' }}>
        <Typography sx={{ color: '#FFE55C', textAlign: 'center' }}>
          Пока нет отзывов. Будьте первым!
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ color: '#FFD700', mb: 2, textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
        Отзывы ({reviews.length})
      </Typography>
      
      {reviews.map((review, index) => (
        <Paper
          key={review.id}
          sx={{
            p: 3,
            mb: 2,
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
            border: '1px solid #FFD700',
            '&:hover': {
              borderColor: '#FFE55C',
              boxShadow: '0 4px 20px rgba(255, 215, 0, 0.2)',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              sx={{
                bgcolor: '#FFD700',
                color: '#000000',
                fontWeight: 'bold',
                mr: 2,
              }}
            >
              {review.user.username.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle1" sx={{ color: '#FFD700', fontWeight: 'bold' }}>
                {review.user.username}
              </Typography>
              <Typography variant="caption" sx={{ color: '#FFE55C' }}>
                {format(new Date(review.created_at), 'dd MMM yyyy')}
              </Typography>
            </Box>
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
          </Box>
          
          <Typography
            variant="body1"
            sx={{
              color: '#FFE55C',
              lineHeight: 1.6,
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
            }}
          >
            {review.comment}
          </Typography>
        </Paper>
      ))}
    </Box>
  );
};

export default ReviewList; 
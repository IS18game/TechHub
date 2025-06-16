import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8002';

interface ApiResponse<T> {
  data: T;
  status: number;
}

interface GetProductsParams {
  category_id?: number | null;
  search?: string;
  skip?: number;
  limit?: number;
}

interface CartItemRequest {
  product_id: number;
  quantity: number;
}

interface ReviewRequest {
  product_id: number;
  rating: number;
  comment: string;
}

interface AuthRequest {
  email: string;
  username?: string;
  password: string;
}

class ApiService {
  private api = axios.create({
    baseURL: `${API_URL}/api/v1`,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  constructor() {
    // Добавляем интерцептор для автоматического добавления токена
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Обработка ошибок
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/auth';
        }
        return Promise.reject(error);
      }
    );
  }

  // Продукты
  async getProducts(params?: GetProductsParams) {
    const { data } = await this.api.get('/products', { params });
    return data;
  }

  async getProduct(id: number) {
    const { data } = await this.api.get(`/products/${id}`);
    return data;
  }

  // Категории
  async getCategories() {
    const { data } = await this.api.get('/categories');
    return data;
  }

  async getCategory(id: number) {
    const { data } = await this.api.get(`/categories/${id}`);
    return data;
  }

  // Корзина
  async getCartItems() {
    const { data } = await this.api.get('/cart/items');
    return data;
  }

  async addToCart(item: CartItemRequest) {
    const { data } = await this.api.post('/cart/items', item);
    return data;
  }

  async updateCartItem(itemId: number, quantity: number) {
    const { data } = await this.api.put(`/cart/items/${itemId}`, { quantity });
    return data;
  }

  async removeFromCart(itemId: number) {
    const { data } = await this.api.delete(`/cart/items/${itemId}`);
    return data;
  }

  // Отзывы
  async getProductReviews(productId: number) {
    const { data } = await this.api.get(`/reviews/product/${productId}`);
    return data;
  }

  async getUserReviews() {
    const { data } = await this.api.get('/reviews/user/me');
    return data;
  }

  async createReview(review: ReviewRequest) {
    const { data } = await this.api.post('/reviews/', review);
    return data;
  }

  async updateReview(reviewId: number, review: Partial<ReviewRequest>) {
    const { data } = await this.api.put(`/reviews/${reviewId}`, review);
    return data;
  }

  async deleteReview(reviewId: number) {
    const { data } = await this.api.delete(`/reviews/${reviewId}`);
    return data;
  }

  // Аутентификация
  async register(userData: AuthRequest) {
    const { data } = await this.api.post('/auth/register', userData);
    return data;
  }

  async login(credentials: { email: string; password: string }) {
    const formData = new URLSearchParams();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);

    const { data } = await this.api.post('/auth/login', formData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return data;
  }

  // Пользователь
  async getCurrentUser() {
    const { data } = await this.api.get('/users/me');
    return data;
  }

  async getUser(id: number) {
    const { data } = await this.api.get(`/users/${id}`);
    return data;
  }

  // Утилитарные методы
  setAuthToken(token: string) {
    localStorage.setItem('token', token);
    this.api.defaults.headers.Authorization = `Bearer ${token}`;
  }

  removeAuthToken() {
    localStorage.removeItem('token');
    delete this.api.defaults.headers.Authorization;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
}

export const apiService = new ApiService();
export default apiService;
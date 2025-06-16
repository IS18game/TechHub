import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  IonImg,
  IonText,
  IonIcon,
  IonItem,
  IonLabel,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonRefresher,
  IonRefresherContent,
  IonAlert,
  IonToast,
  IonSpinner,
  IonBadge,
  IonAvatar,
  IonBackButton,
  IonButtons,
  IonFab,
  IonFabButton
} from '@ionic/react';
import { 
  star, 
  cart, 
  checkmark, 
  close, 
  person,
  add,
  checkmarkCircle,
  alertCircle,
  chatbubble,
  send,
  arrowBack
} from 'ionicons/icons';
import { useParams, useHistory } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';

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
  category: {
    id: number;
    name: string;
  };
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
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  
  // Review form
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  
  // Alerts and toasts
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('success');

  const { isAuthenticated } = useAuth();
  const history = useHistory();

  useEffect(() => {
    loadProductData();
  }, [id]);

  const loadProductData = async () => {
    try {
      setLoading(true);
      const [productData, reviewsData] = await Promise.all([
        apiService.getProduct(parseInt(id!)),
        apiService.getProductReviews(parseInt(id!))
      ]);
      
      setProduct(productData);
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error loading product:', error);
      showToastMessage('Ошибка при загрузке товара', 'danger');
      history.push('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (event: any) => {
    await loadProductData();
    event.detail.complete();
  };

  const addToCart = async () => {
    if (!isAuthenticated) {
      history.push('/auth');
      return;
    }

    if (!product) return;

    try {
      setAddingToCart(true);
      await apiService.addToCart({
        product_id: product.id,
        quantity: quantity
      });
      
      showToastMessage('Товар добавлен в корзину!', 'success');
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      const message = error.response?.data?.detail || 'Ошибка при добавлении в корзину';
      showToastMessage(message, 'danger');
    } finally {
      setAddingToCart(false);
    }
  };

  const submitReview = async () => {
    if (!isAuthenticated) {
      history.push('/auth');
      return;
    }

    if (!reviewComment.trim()) {
      showAlertMessage('Пожалуйста, напишите комментарий');
      return;
    }

    try {
      setSubmittingReview(true);
      await apiService.createReview({
        product_id: parseInt(id!),
        rating: reviewRating,
        comment: reviewComment.trim()
      });

      showToastMessage('Отзыв успешно добавлен!', 'success');
      setShowReviewForm(false);
      setReviewComment('');
      setReviewRating(5);
      
      // Reload data to show new review
      await loadProductData();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      const message = error.response?.data?.detail || 'Ошибка при добавлении отзыва';
      showToastMessage(message, 'danger');
    } finally {
      setSubmittingReview(false);
    }
  };

  const showAlertMessage = (message: string) => {
    setAlertMessage(message);
    setShowAlert(true);
  };

  const showToastMessage = (message: string, color: 'success' | 'danger') => {
    setToastMessage(message);
    setToastColor(color);
    setShowToast(true);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <IonIcon
          key={i}
          icon={star}
          style={{
            color: i <= rating ? 'var(--ion-color-warning)' : 'var(--ion-color-medium)',
            fontSize: '20px'
          }}
        />
      );
    }
    return stars;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU');
    } catch (error) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar color="dark">
            <IonButtons slot="start">
              <IonBackButton defaultHref="/products" color="warning" />
            </IonButtons>
            <IonTitle>
              <IonText color="warning">Загрузка...</IonText>
            </IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent color="dark" className="ion-text-center">
          <div style={{ marginTop: '50%' }}>
            <IonSpinner color="warning" />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (!product) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar color="dark">
            <IonButtons slot="start">
              <IonBackButton defaultHref="/products" color="warning" />
            </IonButtons>
            <IonTitle>
              <IonText color="warning">Товар не найден</IonText>
            </IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent color="dark" />
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="dark">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/products" color="warning" />
          </IonButtons>
          <IonTitle>
            <IonText color="warning" style={{ fontSize: '16px' }}>
              {product.name.length > 20 ? `${product.name.substring(0, 20)}...` : product.name}
            </IonText>
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent color="dark">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        {/* Product Image */}
        <IonCard color="dark" style={{ margin: '16px', border: '1px solid var(--ion-color-warning-shade)' }}>
          <IonImg
            src={product.image_url}
            alt={product.name}
            style={{ height: '250px', objectFit: 'contain', padding: '16px' }}
          />
        </IonCard>

        {/* Product Info */}
        <div style={{ padding: '0 16px' }}>
          <IonText color="warning">
            <h1 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 'bold' }}>
              {product.name}
            </h1>
          </IonText>

          <IonBadge color="medium" style={{ marginBottom: '16px' }}>
            {product.category.name}
          </IonBadge>

          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
            {renderStars(Math.round(product.rating))}
            <IonText color="light" style={{ marginLeft: '8px' }}>
              ({product.rating.toFixed(1)}) • {product.reviews_count} отзывов
            </IonText>
          </div>

          <IonText color="warning">
            <h2 style={{ margin: '0 0 16px 0', fontSize: '32px', fontWeight: 'bold' }}>
              ₽{product.price.toFixed(2)}
            </h2>
          </IonText>

          <IonBadge 
            color={product.stock > 0 ? 'success' : 'danger'}
            style={{ marginBottom: '16px' }}
          >
            <IonIcon 
              icon={product.stock > 0 ? checkmark : close} 
              style={{ marginRight: '4px' }} 
            />
            {product.stock > 0 ? `В наличии: ${product.stock} шт.` : 'Нет в наличии'}
          </IonBadge>

          <IonText color="light">
            <p style={{ lineHeight: '1.6', marginBottom: '24px' }}>
              {product.description}
            </p>
          </IonText>

          {/* Quantity Selector and Add to Cart */}
          {product.stock > 0 && (
            <IonCard color="dark" style={{ border: '1px solid var(--ion-color-warning-shade)' }}>
              <IonCardContent>
                <IonItem color="dark">
                  <IonLabel>Количество:</IonLabel>
                  <IonSelect
                    value={quantity}
                    onIonChange={(e) => setQuantity(e.detail.value)}
                    interface="popover"
                  >
                    {Array.from({ length: Math.min(product.stock, 10) }, (_, i) => (
                      <IonSelectOption key={i + 1} value={i + 1}>
                        {i + 1}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>

                <IonButton
                  expand="block"
                  size="large"
                  onClick={addToCart}
                  disabled={addingToCart}
                  className="techhub-button-gradient"
                  style={{ marginTop: '16px' }}
                >
                  {addingToCart ? (
                    <IonSpinner color="dark" style={{ marginRight: '8px' }} />
                  ) : (
                    <IonIcon icon={cart} slot="start" />
                  )}
                  {addingToCart ? 'Добавление...' : 'Добавить в корзину'}
                </IonButton>
              </IonCardContent>
            </IonCard>
          )}

          {/* Reviews Section */}
          <div style={{ marginTop: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <IonText color="warning">
                <h3 style={{ margin: 0, borderBottom: '2px solid var(--ion-color-warning)', paddingBottom: '8px' }}>
                  Отзывы ({reviews.length})
                </h3>
              </IonText>
              
              {isAuthenticated && (
                <IonButton
                  fill="outline"
                  color="warning"
                  size="small"
                  onClick={() => setShowReviewForm(!showReviewForm)}
                >
                  <IonIcon icon={chatbubble} slot="start" />
                  Оставить отзыв
                </IonButton>
              )}
            </div>

            {/* Review Form */}
            {showReviewForm && (
              <IonCard color="dark" style={{ border: '1px solid var(--ion-color-warning-shade)', marginBottom: '16px' }}>
                <IonCardContent>
                  <IonText color="warning">
                    <h4>Оставить отзыв</h4>
                  </IonText>
                  
                  <IonItem color="dark">
                    <IonLabel>Оценка:</IonLabel>
                    <IonSelect
                      value={reviewRating}
                      onIonChange={(e) => setReviewRating(e.detail.value)}
                      interface="popover"
                    >
                      {[5, 4, 3, 2, 1].map(rating => (
                        <IonSelectOption key={rating} value={rating}>
                          {rating} {rating === 1 ? 'звезда' : rating < 5 ? 'звезды' : 'звезд'}
                        </IonSelectOption>
                      ))}
                    </IonSelect>
                  </IonItem>

                  <IonItem color="dark">
                    <IonLabel position="stacked">Комментарий:</IonLabel>
                    <IonTextarea
                      value={reviewComment}
                      onIonInput={(e) => setReviewComment(e.detail.value!)}
                      placeholder="Поделитесь своим мнением о товаре..."
                      rows={4}
                    />
                  </IonItem>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                    <IonButton
                      expand="block"
                      onClick={submitReview}
                      disabled={submittingReview}
                      className="techhub-button-gradient"
                    >
                      {submittingReview ? (
                        <IonSpinner color="dark" style={{ marginRight: '8px' }} />
                      ) : (
                        <IonIcon icon={send} slot="start" />
                      )}
                      {submittingReview ? 'Отправка...' : 'Отправить'}
                    </IonButton>
                    
                    <IonButton
                      fill="outline"
                      color="medium"
                      onClick={() => setShowReviewForm(false)}
                    >
                      Отмена
                    </IonButton>
                  </div>
                </IonCardContent>
              </IonCard>
            )}

            {/* Reviews List */}
            {reviews.length === 0 ? (
              <IonCard color="dark" style={{ border: '1px solid var(--ion-color-warning-shade)' }}>
                <IonCardContent className="ion-text-center">
                  <IonIcon icon={chatbubble} style={{ fontSize: '48px', color: 'var(--ion-color-medium)' }} />
                  <IonText color="medium">
                    <p>Пока нет отзывов. Будьте первым!</p>
                  </IonText>
                </IonCardContent>
              </IonCard>
            ) : (
              reviews.map((review) => (
                <IonCard key={review.id} color="dark" style={{ border: '1px solid var(--ion-color-warning-shade)', marginBottom: '16px' }}>
                  <IonCardContent>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                      <IonAvatar style={{ width: '40px', height: '40px', marginRight: '12px' }}>
                        <div style={{ 
                          width: '100%', 
                          height: '100%', 
                          backgroundColor: 'var(--ion-color-warning)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          color: '#000000',
                          fontWeight: 'bold'
                        }}>
                          {review.user.username.charAt(0).toUpperCase()}
                        </div>
                      </IonAvatar>
                      <div style={{ flex: 1 }}>
                        <IonText color="warning">
                          <h4 style={{ margin: 0 }}>{review.user.username}</h4>
                        </IonText>
                        <IonText color="light">
                          <small>{formatDate(review.created_at)}</small>
                        </IonText>
                      </div>
                      <div>
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    
                    <IonText color="light">
                      <p style={{ lineHeight: '1.5', margin: 0 }}>
                        {review.comment}
                      </p>
                    </IonText>
                  </IonCardContent>
                </IonCard>
              ))
            )}
          </div>
        </div>

        {/* Bottom padding for fixed button */}
        <div style={{ height: '100px' }} />

        {/* Fixed Add to Cart Button */}
        {product.stock > 0 && (
          <IonFab vertical="bottom" horizontal="end" slot="fixed">
            <IonFabButton color="warning" onClick={addToCart} disabled={addingToCart}>
              <IonIcon icon={addingToCart ? undefined : add} />
              {addingToCart && <IonSpinner color="dark" />}
            </IonFabButton>
          </IonFab>
        )}

        {/* Alert */}
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="Внимание"
          message={alertMessage}
          buttons={['OK']}
        />

        {/* Toast */}
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          color={toastColor}
          icon={toastColor === 'success' ? checkmarkCircle : alertCircle}
        />
      </IonContent>
    </IonPage>
  );
};

export default ProductDetail;
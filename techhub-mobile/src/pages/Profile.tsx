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
  IonList,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonActionSheet
} from '@ionic/react';
import { 
  person, 
  mail, 
  logOut, 
  star,
  create,
  trash,
  ellipsisVertical,
  checkmarkCircle,
  alertCircle,
  chatbubble,
  storefront
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';

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
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(false);
  
  // Edit review
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');
  const [updatingReview, setUpdatingReview] = useState(false);
  
  // Action sheet
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  
  // Alerts and toasts
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('success');

  const { user, logout, isAuthenticated } = useAuth();
  const history = useHistory();

  useEffect(() => {
    if (!isAuthenticated) {
      history.push('/auth');
      return;
    }
    loadUserReviews();
  }, [isAuthenticated]);

  const loadUserReviews = async () => {
    try {
      setLoadingReviews(true);
      const reviews = await apiService.getUserReviews();
      setUserReviews(reviews);
    } catch (error) {
      console.error('Error loading user reviews:', error);
      showToastMessage('Ошибка при загрузке отзывов', 'danger');
    } finally {
      setLoadingReviews(false);
      setLoading(false);
    }
  };

  const handleRefresh = async (event: any) => {
    await loadUserReviews();
    event.detail.complete();
  };

  const handleLogout = () => {
    logout();
    history.push('/home');
  };

  const openReviewActions = (review: Review) => {
    setSelectedReview(review);
    setShowActionSheet(true);
  };

  const startEditReview = (review: Review) => {
    setEditingReview(review);
    setEditRating(review.rating);
    setEditComment(review.comment);
    setShowActionSheet(false);
  };

  const cancelEditReview = () => {
    setEditingReview(null);
    setEditRating(5);
    setEditComment('');
  };

  const saveEditReview = async () => {
    if (!editingReview || !editComment.trim()) {
      showToastMessage('Пожалуйста, заполните комментарий', 'danger');
      return;
    }

    try {
      setUpdatingReview(true);
      await apiService.updateReview(editingReview.id, {
        rating: editRating,
        comment: editComment.trim()
      });

      await loadUserReviews();
      setEditingReview(null);
      showToastMessage('Отзыв обновлен', 'success');
    } catch (error: any) {
      console.error('Error updating review:', error);
      const message = error.response?.data?.detail || 'Ошибка при обновлении отзыва';
      showToastMessage(message, 'danger');
    } finally {
      setUpdatingReview(false);
    }
  };

  const confirmDeleteReview = () => {
    setShowActionSheet(false);
    setShowDeleteAlert(true);
  };

  const deleteReview = async () => {
    if (!selectedReview) return;

    try {
      await apiService.deleteReview(selectedReview.id);
      await loadUserReviews();
      showToastMessage('Отзыв удален', 'success');
    } catch (error: any) {
      console.error('Error deleting review:', error);
      const message = error.response?.data?.detail || 'Ошибка при удалении отзыва';
      showToastMessage(message, 'danger');
    } finally {
      setSelectedReview(null);
      setShowDeleteAlert(false);
    }
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
            fontSize: '16px'
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

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar color="dark">
            <IonTitle>
              <IonText color="warning">Профиль</IonText>
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

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="dark">
          <IonTitle>
            <IonText color="warning">Профиль</IonText>
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent color="dark">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        {/* User Info Card */}
        <IonCard color="dark" style={{ margin: '16px', border: '2px solid var(--ion-color-warning)' }}>
          <IonCardContent>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <IonAvatar style={{ width: '80px', height: '80px', marginRight: '16px' }}>
                <div style={{ 
                  width: '100%', 
                  height: '100%', 
                  backgroundColor: 'var(--ion-color-warning)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: '#000000',
                  fontSize: '32px',
                  fontWeight: 'bold'
                }}>
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
              </IonAvatar>
              <div style={{ flex: 1 }}>
                <IonText color="warning">
                  <h2 style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>
                    {user?.username}
                  </h2>
                </IonText>
                <IonText color="light">
                  <p style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
                    <IonIcon icon={mail} style={{ marginRight: '8px' }} />
                    {user?.email}
                  </p>
                </IonText>
                {user?.is_admin && (
                  <IonBadge color="warning" style={{ marginTop: '8px' }}>
                    <IonIcon icon={storefront} style={{ marginRight: '4px' }} />
                    Администратор
                  </IonBadge>
                )}
              </div>
            </div>
            
            <IonButton
              expand="block"
              fill="outline"
              color="danger"
              onClick={() => setShowLogoutAlert(true)}
            >
              <IonIcon icon={logOut} slot="start" />
              Выйти из аккаунта
            </IonButton>
          </IonCardContent>
        </IonCard>

        {/* Statistics */}
        <IonCard color="dark" style={{ margin: '16px', border: '1px solid var(--ion-color-warning-shade)' }}>
          <IonCardContent>
            <IonText color="warning">
              <h3 style={{ margin: '0 0 16px 0', borderBottom: '2px solid var(--ion-color-warning)', paddingBottom: '8px' }}>
                Статистика
              </h3>
            </IonText>
            <IonGrid>
              <IonRow>
                <IonCol className="ion-text-center">
                  <IonText color="warning">
                    <h2 style={{ margin: 0, fontSize: '32px', fontWeight: 'bold' }}>
                      {userReviews.length}
                    </h2>
                  </IonText>
                  <IonText color="light">
                    <p style={{ margin: 0 }}>Отзывов</p>
                  </IonText>
                </IonCol>
                <IonCol className="ion-text-center">
                  <IonText color="warning">
                    <h2 style={{ margin: 0, fontSize: '32px', fontWeight: 'bold' }}>
                      {userReviews.length > 0 
                        ? (userReviews.reduce((sum, review) => sum + review.rating, 0) / userReviews.length).toFixed(1)
                        : '0.0'
                      }
                    </h2>
                  </IonText>
                  <IonText color="light">
                    <p style={{ margin: 0 }}>Средняя оценка</p>
                  </IonText>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonCardContent>
        </IonCard>

        {/* User Reviews */}
        <div style={{ padding: '0 16px' }}>
          <IonText color="warning">
            <h3 style={{ margin: '0 0 16px 0', borderBottom: '2px solid var(--ion-color-warning)', paddingBottom: '8px' }}>
              <IonIcon icon={chatbubble} style={{ marginRight: '8px' }} />
              Мои отзывы ({userReviews.length})
            </h3>
          </IonText>

          {loadingReviews ? (
            <div className="ion-text-center" style={{ marginTop: '40px' }}>
              <IonSpinner color="warning" />
            </div>
          ) : userReviews.length === 0 ? (
            <IonCard color="dark" style={{ border: '1px solid var(--ion-color-warning-shade)' }}>
              <IonCardContent className="ion-text-center">
                <IonIcon icon={chatbubble} style={{ fontSize: '48px', color: 'var(--ion-color-medium)', marginBottom: '16px' }} />
                <IonText color="medium">
                  <p>У вас пока нет отзывов</p>
                </IonText>
                <IonButton 
                  fill="outline" 
                  color="warning"
                  onClick={() => history.push('/products')}
                >
                  Перейти к покупкам
                </IonButton>
              </IonCardContent>
            </IonCard>
          ) : (
            <IonList>
              {userReviews.map((review) => (
                <IonItemSliding key={review.id}>
                  {editingReview?.id === review.id ? (
                    /* Edit Review Form */
                    <IonCard color="dark" style={{ border: '1px solid var(--ion-color-warning)', marginBottom: '16px' }}>
                      <IonCardContent>
                        <IonText color="warning">
                          <h4>Редактировать отзыв</h4>
                        </IonText>
                        
                        <IonItem color="dark">
                          <IonLabel>Оценка:</IonLabel>
                          <IonSelect
                            value={editRating}
                            onIonChange={(e) => setEditRating(e.detail.value)}
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
                            value={editComment}
                            onIonInput={(e) => setEditComment(e.detail.value!)}
                            rows={4}
                          />
                        </IonItem>

                        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                          <IonButton
                            expand="block"
                            onClick={saveEditReview}
                            disabled={updatingReview}
                            className="techhub-button-gradient"
                          >
                            {updatingReview ? (
                              <IonSpinner color="dark" style={{ marginRight: '8px' }} />
                            ) : (
                              <IonIcon icon={checkmarkCircle} slot="start" />
                            )}
                            {updatingReview ? 'Сохранение...' : 'Сохранить'}
                          </IonButton>
                          
                          <IonButton
                            fill="outline"
                            color="medium"
                            onClick={cancelEditReview}
                            disabled={updatingReview}
                          >
                            Отмена
                          </IonButton>
                        </div>
                      </IonCardContent>
                    </IonCard>
                  ) : (
                    /* Review Display */
                    <IonCard color="dark" style={{ border: '1px solid var(--ion-color-warning-shade)', marginBottom: '16px' }}>
                      <IonCardContent>
                        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                          <IonImg
                            src={review.product.image_url}
                            alt={review.product.name}
                            onClick={() => history.push(`/product/${review.product.id}`)}
                            style={{ 
                              width: '60px', 
                              height: '60px', 
                              objectFit: 'contain',
                              marginRight: '12px',
                              cursor: 'pointer',
                              borderRadius: '8px'
                            }}
                          />
                          <div style={{ flex: 1 }}>
                            <IonText color="warning">
                              <h4 
                                style={{ margin: '0 0 8px 0', cursor: 'pointer' }}
                                onClick={() => history.push(`/product/${review.product.id}`)}
                              >
                                {review.product.name}
                              </h4>
                            </IonText>
                            
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                              {renderStars(review.rating)}
                              <IonText color="light" style={{ marginLeft: '8px' }}>
                                <small>{formatDate(review.created_at)}</small>
                              </IonText>
                            </div>

                            <IonText color="light">
                              <p style={{ margin: 0, lineHeight: '1.5' }}>
                                {review.comment}
                              </p>
                            </IonText>
                          </div>
                          
                          <IonButton
                            fill="clear"
                            size="small"
                            onClick={() => openReviewActions(review)}
                          >
                            <IonIcon icon={ellipsisVertical} />
                          </IonButton>
                        </div>
                      </IonCardContent>
                    </IonCard>
                  )}

                  <IonItemOptions side="end">
                    <IonItemOption color="warning" onClick={() => startEditReview(review)}>
                      <IonIcon icon={create} />
                    </IonItemOption>
                    <IonItemOption color="danger" onClick={() => {
                      setSelectedReview(review);
                      confirmDeleteReview();
                    }}>
                      <IonIcon icon={trash} />
                    </IonItemOption>
                  </IonItemOptions>
                </IonItemSliding>
              ))}
            </IonList>
          )}
        </div>

        {/* Bottom padding */}
        <div style={{ height: '80px' }} />

        {/* Action Sheet */}
        <IonActionSheet
          isOpen={showActionSheet}
          onDidDismiss={() => setShowActionSheet(false)}
          buttons={[
            {
              text: 'Редактировать',
              icon: create,
              handler: () => {
                if (selectedReview) {
                  startEditReview(selectedReview);
                }
              }
            },
            {
              text: 'Удалить',
              icon: trash,
              role: 'destructive',
              handler: () => {
                confirmDeleteReview();
              }
            },
            {
              text: 'Отмена',
              role: 'cancel'
            }
          ]}
        />

        {/* Logout Alert */}
        <IonAlert
          isOpen={showLogoutAlert}
          onDidDismiss={() => setShowLogoutAlert(false)}
          header="Выход из аккаунта"
          message="Вы уверены, что хотите выйти из аккаунта?"
          buttons={[
            {
              text: 'Отмена',
              role: 'cancel'
            },
            {
              text: 'Выйти',
              handler: handleLogout,
              cssClass: 'danger'
            }
          ]}
        />

        {/* Delete Review Alert */}
        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header="Удалить отзыв"
          message="Вы уверены, что хотите удалить этот отзыв?"
          buttons={[
            {
              text: 'Отмена',
              role: 'cancel',
              handler: () => setSelectedReview(null)
            },
            {
              text: 'Удалить',
              handler: deleteReview,
              cssClass: 'danger'
            }
          ]}
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

export default Profile;
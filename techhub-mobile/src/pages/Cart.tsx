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
  IonInput,
  IonRefresher,
  IonRefresherContent,
  RefresherEventDetail,
  IonAlert,
  IonToast,
  IonSpinner,
  IonItemSliding,
  IonItemOptions,
  IonItemOption
} from '@ionic/react';
import { 
  trash, 
  add, 
  remove, 
  card, 
  cart as cartIcon, 
  checkmarkCircle,
  alertCircle 
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';

interface CartItem {
  id: number;
  product: {
    id: number;
    name: string;
    price: number;
    image_url: string;
    stock: number;
  };
  quantity: number;
}

const Cart: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('success');
  
  const { isAuthenticated } = useAuth();
  const history = useHistory();

  useEffect(() => {
    if (!isAuthenticated) {
      history.push('/auth');
      return;
    }
    loadCart();
  }, [isAuthenticated]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const data = await apiService.getCartItems();
      setCartItems(data);
    } catch (error) {
      console.error('Error loading cart:', error);
      showToastMessage('Ошибка при загрузке корзины', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    await loadCart();
    event.detail.complete();
  };

  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    const item = cartItems.find(item => item.id === itemId);
    if (!item) return;

    if (newQuantity > item.product.stock) {
      showToastMessage(`Доступно только ${item.product.stock} шт.`, 'danger');
      return;
    }

    try {
      setUpdating(itemId);
      await apiService.updateCartItem(itemId, newQuantity);
      
      setCartItems(prev => 
        prev.map(item => 
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
      
      showToastMessage('Количество обновлено', 'success');
    } catch (error) {
      console.error('Error updating quantity:', error);
      showToastMessage('Ошибка при обновлении количества', 'danger');
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (itemId: number) => {
    try {
      await apiService.removeFromCart(itemId);
      setCartItems(prev => prev.filter(item => item.id !== itemId));
      showToastMessage('Товар удален из корзины', 'success');
    } catch (error) {
      console.error('Error removing item:', error);
      showToastMessage('Ошибка при удалении товара', 'danger');
    }
  };

  const confirmDelete = (itemId: number) => {
    setItemToDelete(itemId);
    setShowDeleteAlert(true);
  };

  const handleDelete = () => {
    if (itemToDelete) {
      removeItem(itemToDelete);
      setItemToDelete(null);
    }
    setShowDeleteAlert(false);
  };

  const showToastMessage = (message: string, color: 'success' | 'danger') => {
    setToastMessage(message);
    setToastColor(color);
    setShowToast(true);
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const navigateToProduct = (productId: number) => {
    history.push(`/product/${productId}`);
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
              <IonText color="warning">Корзина</IonText>
            </IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent color="dark" className="ion-text-center">
          <div style={{ marginTop: '50%' }}>
            <IonSpinner color="warning" />
            <IonText color="light">
              <p>Загрузка корзины...</p>
            </IonText>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (cartItems.length === 0) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar color="dark">
            <IonTitle>
              <IonText color="warning">Корзина</IonText>
            </IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent color="dark">
          <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
            <IonRefresherContent />
          </IonRefresher>

          <div className="ion-text-center" style={{ marginTop: '50%', padding: '32px' }}>
            <IonIcon 
              icon={cartIcon} 
              style={{ fontSize: '80px', color: 'var(--ion-color-warning)', marginBottom: '24px' }} 
            />
            <IonText color="warning">
              <h2>Корзина пуста</h2>
            </IonText>
            <IonText color="light">
              <p>Добавьте товары в корзину, чтобы начать покупки</p>
            </IonText>
            <IonButton 
              expand="block" 
              color="warning" 
              onClick={() => history.push('/products')}
              style={{ marginTop: '24px' }}
            >
              Перейти к покупкам
            </IonButton>
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
            <IonText color="warning">Корзина ({cartItems.length})</IonText>
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent color="dark">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        {/* Cart Items */}
        <div style={{ padding: '16px 16px 120px 16px' }}>
          {cartItems.map((item) => (
            <IonItemSliding key={item.id}>
              <IonCard 
                color="dark" 
                style={{ 
                  border: '1px solid var(--ion-color-warning-shade)',
                  marginBottom: '16px'
                }}
              >
                <IonCardContent>
                  <IonGrid>
                    <IonRow>
                      <IonCol size="3">
                        <IonImg
                          src={item.product.image_url}
                          alt={item.product.name}
                          onClick={() => navigateToProduct(item.product.id)}
                          style={{ 
                            height: '80px', 
                            objectFit: 'contain',
                            cursor: 'pointer'
                          }}
                        />
                      </IonCol>
                      <IonCol size="9">
                        <IonText color="warning">
                          <h3 
                            style={{ margin: '0 0 8px 0', fontSize: '16px', cursor: 'pointer' }}
                            onClick={() => navigateToProduct(item.product.id)}
                          >
                            {item.product.name}
                          </h3>
                        </IonText>
                        
                        <IonText color="light">
                          <p style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 'bold' }}>
                            ₽{item.product.price.toFixed(2)}
                          </p>
                        </IonText>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <IonButton
                              fill="clear"
                              size="small"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1 || updating === item.id}
                            >
                              <IonIcon icon={remove} />
                            </IonButton>
                            
                            <IonText color="warning" style={{ margin: '0 12px', fontSize: '18px', fontWeight: 'bold' }}>
                              {updating === item.id ? (
                                <IonSpinner color="warning" style={{ width: '20px', height: '20px' }} />
                              ) : (
                                item.quantity
                              )}
                            </IonText>
                            
                            <IonButton
                              fill="clear"
                              size="small"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.product.stock || updating === item.id}
                            >
                              <IonIcon icon={add} />
                            </IonButton>
                          </div>

                          <IonText color="warning">
                            <strong style={{ fontSize: '18px' }}>
                              ₽{(item.product.price * item.quantity).toFixed(2)}
                            </strong>
                          </IonText>
                        </div>

                        {item.quantity >= item.product.stock && (
                          <IonText color="danger">
                            <small>Максимальное количество: {item.product.stock}</small>
                          </IonText>
                        )}
                      </IonCol>
                    </IonRow>
                  </IonGrid>
                </IonCardContent>
              </IonCard>

              <IonItemOptions side="end">
                <IonItemOption color="danger" onClick={() => confirmDelete(item.id)}>
                  <IonIcon icon={trash} />
                </IonItemOption>
              </IonItemOptions>
            </IonItemSliding>
          ))}
        </div>

        {/* Total and Checkout */}
        <div 
          style={{ 
            position: 'fixed',
            bottom: '56px',
            left: 0,
            right: 0,
            backgroundColor: 'var(--ion-color-dark)',
            borderTop: '2px solid var(--ion-color-warning)',
            padding: '16px',
            zIndex: 1000
          }}
        >
          <IonGrid>
            <IonRow>
              <IonCol size="6">
                <IonText color="light">
                  <p style={{ margin: 0, fontSize: '14px' }}>Итого:</p>
                </IonText>
                <IonText color="warning">
                  <h2 style={{ margin: 0, fontWeight: 'bold' }}>
                    ₽{calculateTotal().toFixed(2)}
                  </h2>
                </IonText>
              </IonCol>
              <IonCol size="6">
                <IonButton
                  expand="block"
                  color="warning"
                  size="large"
                  className="techhub-button-gradient"
                >
                  <IonIcon icon={card} slot="start" />
                  Оформить заказ
                </IonButton>
              </IonCol>
            </IonRow>
          </IonGrid>
        </div>

        {/* Delete Confirmation Alert */}
        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header="Удалить товар"
          message="Вы уверены, что хотите удалить этот товар из корзины?"
          buttons={[
            {
              text: 'Отмена',
              role: 'cancel',
              cssClass: 'secondary'
            },
            {
              text: 'Удалить',
              handler: handleDelete,
              cssClass: 'danger'
            }
          ]}
        />

        {/* Toast */}
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          color={toastColor}
          icon={toastColor === 'success' ? checkmarkCircle : alertCircle}
        />
      </IonContent>
    </IonPage>
  );
};

export default Cart;
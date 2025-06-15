import React, { useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
  IonText,
  IonIcon,
  IonSegment,
  IonSegmentButton,
  IonAlert,
  IonSpinner,
  IonToast
} from '@ionic/react';
import { 
  person, 
  mail, 
  lockClosed, 
  logIn, 
  personAdd,
  checkmarkCircle,
  alertCircle 
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';

const Auth: React.FC = () => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('success');

  const { login } = useAuth();
  const history = useHistory();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.email || !formData.password) {
      showAlertMessage('Пожалуйста, заполните все обязательные поля');
      return false;
    }

    if (authMode === 'register') {
      if (!formData.username) {
        showAlertMessage('Пожалуйста, введите имя пользователя');
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        showAlertMessage('Пароли не совпадают');
        return false;
      }

      if (formData.password.length < 6) {
        showAlertMessage('Пароль должен содержать минимум 6 символов');
        return false;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showAlertMessage('Пожалуйста, введите корректный email');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      if (authMode === 'login') {
        const response = await apiService.login({
          email: formData.email,
          password: formData.password
        });

        await login(response.access_token);
        showToastMessage('Добро пожаловать!', 'success');
        
        setTimeout(() => {
          history.push('/home');
        }, 1000);

      } else {
        await apiService.register({
          email: formData.email,
          username: formData.username,
          password: formData.password
        });

        showToastMessage('Регистрация успешна! Теперь войдите в систему', 'success');
        setAuthMode('login');
        setFormData(prev => ({ ...prev, username: '', confirmPassword: '' }));
      }

    } catch (error: any) {
      console.error('Auth error:', error);
      const message = error.response?.data?.detail || 
                     (authMode === 'login' ? 'Ошибка входа' : 'Ошибка регистрации');
      showAlertMessage(message);
    } finally {
      setLoading(false);
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

  const switchMode = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setFormData({
      email: '',
      username: '',
      password: '',
      confirmPassword: ''
    });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="dark">
          <IonTitle>
            <IonText color="warning">TechHub</IonText>
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent color="dark" className="ion-padding">
        
        {/* Logo/Header */}
        <div className="ion-text-center" style={{ marginTop: '40px', marginBottom: '40px' }}>
          <IonIcon 
            icon={authMode === 'login' ? logIn : personAdd} 
            style={{ fontSize: '80px', color: 'var(--ion-color-warning)' }} 
          />
          <IonText color="warning">
            <h1 style={{ margin: '16px 0 8px 0', fontWeight: 'bold' }}>
              {authMode === 'login' ? 'Вход' : 'Регистрация'}
            </h1>
          </IonText>
          <IonText color="light">
            <p style={{ margin: 0 }}>
              {authMode === 'login' 
                ? 'Добро пожаловать обратно!' 
                : 'Создайте новый аккаунт'
              }
            </p>
          </IonText>
        </div>

        {/* Mode Selector */}
        <IonSegment 
          value={authMode} 
          onIonChange={(e) => switchMode(e.detail.value as 'login' | 'register')}
          style={{ marginBottom: '32px' }}
          color="warning"
        >
          <IonSegmentButton value="login">
            <IonLabel>Вход</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="register">
            <IonLabel>Регистрация</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        {/* Form */}
        <IonCard color="dark" style={{ border: '1px solid var(--ion-color-warning-shade)' }}>
          <IonCardContent>
            
            {/* Email */}
            <IonItem color="dark" style={{ marginBottom: '16px' }}>
              <IonIcon icon={mail} slot="start" color="warning" />
              <IonLabel position="stacked" color="warning">Email</IonLabel>
              <IonInput
                type="email"
                value={formData.email}
                onIonInput={(e) => handleInputChange('email', e.detail.value!)}
                placeholder="Введите ваш email"
                color="light"
              />
            </IonItem>

            {/* Username (only for register) */}
            {authMode === 'register' && (
              <IonItem color="dark" style={{ marginBottom: '16px' }}>
                <IonIcon icon={person} slot="start" color="warning" />
                <IonLabel position="stacked" color="warning">Имя пользователя</IonLabel>
                <IonInput
                  type="text"
                  value={formData.username}
                  onIonInput={(e) => handleInputChange('username', e.detail.value!)}
                  placeholder="Введите имя пользователя"
                  color="light"
                />
              </IonItem>
            )}

            {/* Password */}
            <IonItem color="dark" style={{ marginBottom: '16px' }}>
              <IonIcon icon={lockClosed} slot="start" color="warning" />
              <IonLabel position="stacked" color="warning">Пароль</IonLabel>
              <IonInput
                type="password"
                value={formData.password}
                onIonInput={(e) => handleInputChange('password', e.detail.value!)}
                placeholder="Введите пароль"
                color="light"
              />
            </IonItem>

            {/* Confirm Password (only for register) */}
            {authMode === 'register' && (
              <IonItem color="dark" style={{ marginBottom: '24px' }}>
                <IonIcon icon={lockClosed} slot="start" color="warning" />
                <IonLabel position="stacked" color="warning">Подтвердите пароль</IonLabel>
                <IonInput
                  type="password"
                  value={formData.confirmPassword}
                  onIonInput={(e) => handleInputChange('confirmPassword', e.detail.value!)}
                  placeholder="Подтвердите пароль"
                  color="light"
                />
              </IonItem>
            )}

            {/* Submit Button */}
            <IonButton
              expand="block"
              onClick={handleSubmit}
              disabled={loading}
              className="techhub-button-gradient"
              size="large"
            >
              {loading ? (
                <IonSpinner color="dark" style={{ marginRight: '8px' }} />
              ) : (
                <IonIcon 
                  icon={authMode === 'login' ? logIn : personAdd} 
                  slot="start" 
                />
              )}
              {loading 
                ? (authMode === 'login' ? 'Вход...' : 'Регистрация...')
                : (authMode === 'login' ? 'Войти' : 'Зарегистрироваться')
              }
            </IonButton>

            {/* Switch Mode Text */}
            <div className="ion-text-center" style={{ marginTop: '24px' }}>
              <IonText color="light">
                <p>
                  {authMode === 'login' 
                    ? 'Нет аккаунта? ' 
                    : 'Уже есть аккаунт? '
                  }
                  <span 
                    style={{ 
                      color: 'var(--ion-color-warning)', 
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                    onClick={() => switchMode(authMode === 'login' ? 'register' : 'login')}
                  >
                    {authMode === 'login' ? 'Зарегистрируйтесь' : 'Войдите'}
                  </span>
                </p>
              </IonText>
            </div>

            {/* Demo Credentials */}
            {authMode === 'login' && (
              <div 
                style={{ 
                  marginTop: '24px', 
                  padding: '16px', 
                  backgroundColor: 'var(--ion-color-dark-tint)',
                  borderRadius: '8px',
                  border: '1px solid var(--ion-color-warning-shade)'
                }}
              >
                <IonText color="warning">
                  <h4 style={{ margin: '0 0 8px 0' }}>Демо аккаунт:</h4>
                </IonText>
                <IonText color="light">
                  <p style={{ margin: '4px 0', fontSize: '14px' }}>
                    Email: admin@admin.com
                  </p>
                  <p style={{ margin: '4px 0', fontSize: '14px' }}>
                    Пароль: admin
                  </p>
                </IonText>
                <IonButton
                  fill="outline"
                  size="small"
                  color="warning"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      email: 'admin@admin.com',
                      password: 'admin'
                    });
                  }}
                  style={{ marginTop: '8px' }}
                >
                  Заполнить
                </IonButton>
              </div>
            )}

          </IonCardContent>
        </IonCard>

        {/* Error Alert */}
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="Ошибка"
          message={alertMessage}
          buttons={['OK']}
        />

        {/* Success Toast */}
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

export default Auth;
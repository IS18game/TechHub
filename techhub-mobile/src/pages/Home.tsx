import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  IonImg,
  IonText,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  RefresherEventDetail,
  IonBadge,
  IonSearchbar
} from '@ionic/react';
import { star, arrowForward, flash, heart } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { apiService } from '../services/api';

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
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const history = useHistory();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        apiService.getProducts(),
        apiService.getCategories()
      ]);

      // Получаем топ-3 товара по рейтингу
      const sortedProducts = productsData
        .sort((a: Product, b: Product) => b.rating - a.rating)
        .slice(0, 3);

      setFeaturedProducts(sortedProducts);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    await loadData();
    event.detail.complete();
  };

  const navigateToProduct = (productId: number) => {
    history.push(`/product/${productId}`);
  };

  const navigateToProducts = (categoryId?: number) => {
    if (categoryId) {
      history.push(`/products?category=${categoryId}`);
    } else {
      history.push('/products');
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="dark">
          <IonTitle>
            <IonText color="warning">
              <h1 style={{ margin: 0, fontWeight: 'bold' }}>TechHub</h1>
            </IonText>
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen color="dark">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        {/* Hero Section */}
        <IonCard color="dark" style={{ margin: '16px', border: '2px solid var(--ion-color-warning)' }}>
          <IonCardContent className="ion-text-center">
            <IonIcon 
              icon={flash} 
              style={{ fontSize: '48px', color: 'var(--ion-color-warning)' }}
            />
            <IonCardTitle color="warning" style={{ fontSize: '24px', margin: '16px 0' }}>
              Добро пожаловать в TechHub
            </IonCardTitle>
            <IonText color="light">
              <p>Ваш универсальный магазин компьютерных комплектующих</p>
            </IonText>
            <IonButton 
              expand="block" 
              color="warning" 
              onClick={() => navigateToProducts()}
              style={{ marginTop: '16px' }}
            >
              Купить сейчас
              <IonIcon icon={arrowForward} slot="end" />
            </IonButton>
          </IonCardContent>
        </IonCard>

        {/* Search Bar */}
        <div style={{ padding: '0 16px' }}>
          <IonSearchbar
            value={searchText}
            onIonInput={(e) => setSearchText(e.detail.value!)}
            placeholder="Поиск товаров..."
            color="dark"
            style={{ 
              '--background': 'var(--ion-color-dark-tint)',
              '--color': 'var(--ion-color-warning)'
            }}
          />
        </div>

        {/* Featured Products */}
        <div style={{ padding: '16px' }}>
          <IonText color="warning">
            <h2 style={{ margin: '0 0 16px 0', borderBottom: '2px solid var(--ion-color-warning)', paddingBottom: '8px' }}>
              <IonIcon icon={heart} style={{ marginRight: '8px' }} />
              Рекомендуемые товары
            </h2>
          </IonText>
          
          <IonGrid>
            <IonRow>
              {featuredProducts.map((product) => (
                <IonCol size="12" key={product.id}>
                  <IonCard 
                    color="dark" 
                    button 
                    onClick={() => navigateToProduct(product.id)}
                    style={{ border: '1px solid var(--ion-color-warning-shade)' }}
                  >
                    <IonRow>
                      <IonCol size="4">
                        <IonImg
                          src={product.image_url}
                          alt={product.name}
                          style={{ 
                            height: '100px', 
                            objectFit: 'contain',
                            padding: '8px'
                          }}
                        />
                      </IonCol>
                      <IonCol size="8">
                        <IonCardContent>
                          <IonCardTitle color="warning" style={{ fontSize: '16px' }}>
                            {product.name}
                          </IonCardTitle>
                          <div style={{ display: 'flex', alignItems: 'center', margin: '8px 0' }}>
                            <IonIcon icon={star} style={{ color: 'var(--ion-color-warning)', marginRight: '4px' }} />
                            <IonText color="light">
                              <small>({product.rating}) • {product.reviews_count} отзывов</small>
                            </IonText>
                          </div>
                          <IonText color="warning">
                            <h3 style={{ margin: 0, fontWeight: 'bold' }}>
                              ₽{product.price.toFixed(2)}
                            </h3>
                          </IonText>
                        </IonCardContent>
                      </IonCol>
                    </IonRow>
                  </IonCard>
                </IonCol>
              ))}
            </IonRow>
          </IonGrid>

          <IonButton 
            expand="block" 
            fill="outline" 
            color="warning"
            onClick={() => navigateToProducts()}
            style={{ margin: '16px' }}
          >
            Показать все товары
            <IonIcon icon={arrowForward} slot="end" />
          </IonButton>
        </div>

        {/* Categories */}
        <div style={{ padding: '16px' }}>
          <IonText color="warning">
            <h2 style={{ margin: '0 0 16px 0', borderBottom: '2px solid var(--ion-color-warning)', paddingBottom: '8px' }}>
              Категории
            </h2>
          </IonText>
          
          <IonGrid>
            <IonRow>
              {categories.map((category) => (
                <IonCol size="6" key={category.id}>
                  <IonCard 
                    color="dark" 
                    button 
                    onClick={() => navigateToProducts(category.id)}
                    style={{ border: '1px solid var(--ion-color-warning-shade)', minHeight: '120px' }}
                  >
                    <IonCardContent className="ion-text-center">
                      <IonCardTitle color="warning" style={{ fontSize: '14px', marginBottom: '8px' }}>
                        {category.name}
                      </IonCardTitle>
                      <IonText color="light">
                        <small>{category.description}</small>
                      </IonText>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              ))}
            </IonRow>
          </IonGrid>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
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
  IonCardTitle,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  IonImg,
  IonText,
  IonIcon,
  IonSelect,
  IonSelectOption,
  IonItem,
  IonLabel,
  IonRefresher,
  IonRefresherContent,
  RefresherEventDetail,
  IonBadge,
  IonSearchbar,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonSpinner
} from '@ionic/react';
import { star, pricetag, checkmark, close } from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router-dom';
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
}

interface Category {
  id: number;
  name: string;
  description: string;
}

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const history = useHistory();
  const location = useLocation();

  useEffect(() => {
    loadCategories();
    loadProducts(true);
  }, [selectedCategory, searchText]);

  useEffect(() => {
    // Проверяем URL параметры для категории
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get('category');
    if (categoryParam) {
      setSelectedCategory(parseInt(categoryParam));
    }
  }, [location]);

  const loadCategories = async () => {
    try {
      const data = await apiService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadProducts = async (reset = false, pageNum = 0) => {
    try {
      if (reset) {
        setLoading(true);
        setPage(0);
      }

      const data = await apiService.getProducts({
        category_id: selectedCategory,
        search: searchText,
        skip: pageNum * 20,
        limit: 20
      });

      if (reset) {
        setProducts(data);
      } else {
        setProducts(prev => [...prev, ...data]);
      }

      setHasMore(data.length === 20);
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    await loadProducts(true);
    event.detail.complete();
  };

  const loadMore = async (event: CustomEvent<void>) => {
    const nextPage = page + 1;
    await loadProducts(false, nextPage);
    (event.target as HTMLIonInfiniteScrollElement).complete();
  };

  const navigateToProduct = (productId: number) => {
    history.push(`/product/${productId}`);
  };

  const handleCategoryChange = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    if (categoryId) {
      history.push(`/products?category=${categoryId}`);
    } else {
      history.push('/products');
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchText.toLowerCase()) ||
    product.description.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="dark">
          <IonTitle>
            <IonText color="warning">Товары</IonText>
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen color="dark">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        {/* Search and Filter */}
        <div style={{ padding: '16px' }}>
          <IonSearchbar
            value={searchText}
            onIonInput={(e) => setSearchText(e.detail.value!)}
            placeholder="Поиск товаров..."
            color="dark"
            style={{ 
              '--background': 'var(--ion-color-dark-tint)',
              '--color': 'var(--ion-color-warning)',
              marginBottom: '16px'
            }}
          />

          <IonItem color="dark">
            <IonLabel>Категория</IonLabel>
            <IonSelect
              value={selectedCategory}
              placeholder="Все категории"
              onIonChange={(e) => handleCategoryChange(e.detail.value)}
              interface="popover"
            >
              <IonSelectOption value={null}>Все категории</IonSelectOption>
              {categories.map(category => (
                <IonSelectOption key={category.id} value={category.id}>
                  {category.name}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
        </div>

        {/* Products Grid */}
        {loading && products.length === 0 ? (
          <div className="ion-text-center" style={{ marginTop: '50px' }}>
            <IonSpinner color="warning" />
            <IonText color="light">
              <p>Загрузка товаров...</p>
            </IonText>
          </div>
        ) : (
          <IonGrid style={{ padding: '0 16px' }}>
            <IonRow>
              {filteredProducts.map((product) => (
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
                            height: '120px', 
                            objectFit: 'contain',
                            padding: '8px'
                          }}
                        />
                      </IonCol>
                      <IonCol size="8">
                        <IonCardContent>
                          <IonCardTitle color="warning" style={{ fontSize: '16px', marginBottom: '8px' }}>
                            {product.name}
                          </IonCardTitle>
                          
                          <div style={{ display: 'flex', alignItems: 'center', margin: '8px 0' }}>
                            <IonIcon icon={star} style={{ color: 'var(--ion-color-warning)', marginRight: '4px' }} />
                            <IonText color="light">
                              <small>({product.rating}) • {product.reviews_count} отзывов</small>
                            </IonText>
                          </div>

                          <IonText color="light">
                            <p style={{ fontSize: '12px', margin: '8px 0' }}>
                              {product.description.length > 80 
                                ? `${product.description.substring(0, 80)}...` 
                                : product.description
                              }
                            </p>
                          </IonText>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                            <IonText color="warning">
                              <h3 style={{ margin: 0, fontWeight: 'bold' }}>
                                <IonIcon icon={pricetag} style={{ marginRight: '4px' }} />
                                ₽{product.price.toFixed(2)}
                              </h3>
                            </IonText>
                            
                            <IonBadge 
                              color={product.stock > 0 ? 'success' : 'danger'}
                              style={{ fontSize: '10px' }}
                            >
                              <IonIcon icon={product.stock > 0 ? checkmark : close} style={{ marginRight: '2px' }} />
                              {product.stock > 0 ? `${product.stock} шт.` : 'Нет в наличии'}
                            </IonBadge>
                          </div>
                        </IonCardContent>
                      </IonCol>
                    </IonRow>
                  </IonCard>
                </IonCol>
              ))}
            </IonRow>
          </IonGrid>
        )}

        <IonInfiniteScroll
          onIonInfinite={loadMore}
          threshold="100px"
          disabled={!hasMore}
        >
          <IonInfiniteScrollContent
            loadingSpinner="bubbles"
            loadingText="Загрузка товаров..."
          />
        </IonInfiniteScroll>
      </IonContent>
    </IonPage>
  );
};

export default Products;
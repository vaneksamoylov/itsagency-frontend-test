// Создаем экземпляр Axios с базовой конфигурацией
const apiClient = axios.create({
  baseURL: 'https://6877d8a3dba809d901f12028.mockapi.io/api/colors',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Интерсепторы для обработки ошибок
apiClient.interceptors.response.use(
  response => response.data,
  error => {
    console.error('API Error:', error);
    throw error;
  }
);

export default {
  // Получение списка продуктов
  async getProducts(params = {}) {
    return apiClient.get('/paintBuckets', { params });
  },

  // Получение одного продукта
  async getProduct(id) {
    return apiClient.get(`/paintBuckets/${id}`);
  },

  // Создание продукта
  async createProduct(productData) {
    return apiClient.post('/paintBuckets', productData);
  },

  // Работа с корзиной
  async getCart() {
    return apiClient.get('/cart-list');
  },
  
  async addToCart(item) {
    return apiClient.post('/cart-list', item);
  },
  
  async updateCartItem(id, updates) {
    return apiClient.put(`/cart-list/${id}`, updates);
  },
  
  async removeFromCart(id) {
    return apiClient.delete(`/cart-list/${id}`);
  },
  
  // Заготовка оформления заказа
  // async createOrder(cartItems) {
  //   // Преобразуем данные корзины в формат заказа
  //   const order = {
  //     items: cartItems.map(item => ({
  //       productId: item.productId,
  //       title: item.title,
  //       price: item.price,
  //       quantity: item.quantity
  //     })),
  //     total: cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
  //     date: new Date().toISOString()
  //   };
    
  //   return apiClient.post('/orders', order);
  // }
};
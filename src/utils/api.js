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

  async clearCart() {
    const cartItems = await this.getCart();
    
    await Promise.all(
      cartItems.map(item => this.removeFromCart(item.id))
    );
    
    return { success: true };
  }
};
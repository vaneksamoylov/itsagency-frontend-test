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
  }
};
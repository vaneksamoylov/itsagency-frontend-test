import api from './api.js';

class CartService {
  constructor() {
    this.cart = [];
    this._init();
  }

  async _init() {
    await this._loadFromServer();
    window.addEventListener('storage', this._handleStorageEvent.bind(this));
  }

  async _loadFromServer() {
    try {
      const serverCart = await api.getCart();
      this.cart = serverCart.map(item => ({
        ...item,
        // Добавляем productId для совместимости
        productId: item.productId || item.id 
      }));
      this._saveToLocalStorage();
      this._dispatchUpdate();
    } catch (error) {
      console.error('Error loading cart from server:', error);
      await this._loadFromLocalStorage();
    }
  }

  async _loadFromLocalStorage() {
    const cartData = localStorage.getItem('cart');
    if (cartData) {
      try {
        this.cart = JSON.parse(cartData);
      } catch (e) {
        console.error('Error parsing cart data', e);
        this.cart = [];
      }
    }
  }

  _saveToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(this.cart));
  }

  _dispatchUpdate() {
    const event = new CustomEvent('cart-updated', {
      detail: { cart: this.cart }
    });
    window.dispatchEvent(event);
  }

  _handleStorageEvent(e) {
    if (e.key === 'cart') {
      this._loadFromLocalStorage();
      this._dispatchUpdate();
    }
  }

  async addItem(product) {
    const existingItem = this.cart.find(item => item.productId === product.id);
    
    if (existingItem) {
      return this.updateQuantity(product.id, existingItem.quantity + 1);
    }
    
    const newItem = {
      productId: product.id,
      title: product.title,
      image: product.image,
      price: product.price,
      quantity: 1,
    };

    try {
      const createdItem = await api.addToCart(newItem);
      this.cart.push({
        ...newItem,
        id: createdItem.id,
        createdAt: createdItem.createdAt
      });
      this._saveToLocalStorage();
      this._dispatchUpdate();
    } catch (error) {
      console.error('Error adding item to cart:', error);
    }
  }

  async removeItem(productId) {
    const item = this.cart.find(item => item.productId === productId);
    if (!item) return;

    try {
      await api.removeFromCart(item.id);
      this.cart = this.cart.filter(i => i.productId !== productId);
      this._saveToLocalStorage();
      this._dispatchUpdate();
    } catch (error) {
      console.error('Error removing item from cart:', error);
    }
  }

  async updateQuantity(productId, quantity) {
    if (quantity < 1) return this.removeItem(productId);
    
    const item = this.cart.find(item => item.productId === productId);
    if (!item) return;

    try {
      await api.updateCartItem(item.id, { quantity });
      item.quantity = quantity;
      this._saveToLocalStorage();
      this._dispatchUpdate();
    } catch (error) {
      console.error('Error updating item quantity:', error);
    }
  }

  getCart() {
    return [...this.cart];
  }

  getTotalCount() {
    return this.cart.reduce((total, item) => total + item.quantity, 0);
  }

  async clearCart() {
    try {
      // Удаляем все элементы корзины на сервере
      await Promise.all(this.cart.map(item => api.removeFromCart(item.id)));
      
      this.cart = [];
      this._saveToLocalStorage();
      this._dispatchUpdate();
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  }
}

// Экспортируем singleton экземпляр
export const cartService = new CartService();
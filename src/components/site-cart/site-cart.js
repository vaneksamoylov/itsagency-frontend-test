import { loadStyles } from "../../utils/helpers.js";
import { cartService } from "../../utils/cart-service.js";

class SiteCart extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.cartItems = [];
  }

  async connectedCallback() {
    const styles = await loadStyles("site-cart");
    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <div class="cart">
        <div class="cart__items" id="cartItems"></div>
        
        <div class="cart__footer">
          <div class="cart__footer-total">
            <span class="cart__footer-total-text">Итого:</span>
            <span class="cart__footer-total-price" id="cartTotalPrice">0 ₽</span>
          </div>

          <button class="cart__checkout-button" id="checkoutButton">Оформить заказ</button>
        </div>
      </div>
    `;

    this.cartItemsContainer = this.shadowRoot.getElementById("cartItems");
    this.cartTotalPrice = this.shadowRoot.getElementById("cartTotalPrice");
    this.checkoutButton = this.shadowRoot.getElementById("checkoutButton");

    this.checkoutButton.addEventListener("click", () => this.checkout());

    window.addEventListener("cart-updated", () => this.updateCart());
    this.updateCart();
  }

  updateCart() {
    this.cartItems = cartService.getCart();
    this.renderCartItems();
    this.updateTotal();
  }

  renderCartItems() {
    this.cartItemsContainer.innerHTML = "";

    if (this.cartItems.length === 0) {
      this.cartItemsContainer.innerHTML = `
        <div class="cart__empty">
          <p>Ваша корзина пуста</p>
        </div>
      `;
      return;
    }

    this.cartItems.forEach((item) => {
      const cartItem = document.createElement("div");
      cartItem.className = "cart__item";
      cartItem.innerHTML = `
        <div class="cart__item-info">
            <img src="${item.image}" alt="${item.title}" class="cart__item-image">
            <div class="cart__item-textarea">
            <h3 class="cart__item-title">${item.title}</h3>
            <p class="cart__item-price">${item.price} ₽</p>
            </div>
        </div>
        <div class="cart__item-quantity-controls">
            <button class="cart__item-quantity-btn cart__item-quantity-btn_minus" data-action="decrease" data-id="${item.productId}"></button>
            <span class="cart__item-quantity">${item.quantity}</span>
            <button class="cart__item-quantity-btn cart__item-quantity-btn_plus" data-action="increase" data-id="${item.productId}"></button>
        </div>
        <button class="cart__item-remove-button" data-id="${item.productId}"></button>
      `;
      this.cartItemsContainer.appendChild(cartItem);
    });

    // Обработчики изменения количества
    this.shadowRoot
      .querySelectorAll('[data-action="decrease"]')
      .forEach((button) => {
        button.addEventListener("click", (e) => {
          const productId = e.target.dataset.id;
          const item = this.cartItems.find((i) => i.productId === productId);

          if (item && item.quantity > 1) {
            cartService.updateQuantity(productId, item.quantity - 1);
          } else {
            cartService.removeItem(productId);
          }
        });
      });

    this.shadowRoot
      .querySelectorAll('[data-action="increase"]')
      .forEach((button) => {
        button.addEventListener("click", (e) => {
          const productId = e.target.dataset.id;
          const item = this.cartItems.find((i) => i.productId === productId);

          if (item) {
            cartService.updateQuantity(productId, item.quantity + 1);
          }
        });
      });

    // Обработчики удаления
    this.shadowRoot
      .querySelectorAll(".cart__item-remove-button")
      .forEach((button) => {
        button.addEventListener("click", (e) => {
          const productId = e.target.dataset.id;
          cartService.removeItem(productId);
        });
      });
  }

  updateTotal() {
    const total = this.cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    this.cartTotalPrice.textContent = `${total} ₽`;
  }

  async checkout() {
    alert("Заказ успешно оформлен! Отправлять на сервер мы его не будем :)")
  }
}

customElements.define("site-cart", SiteCart);

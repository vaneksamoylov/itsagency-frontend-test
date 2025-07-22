import { loadStyles } from "../../utils/helpers.js";
import { cartService } from "../../utils/cart-service.js";

class SiteProductCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  static get observedAttributes() {
    return ["product"];
  }

  async connectedCallback() {
    const styles = await loadStyles("site-product-card");
    const product = JSON.parse(this.getAttribute("product")) || {};

    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <div class="product-card" id="product-card">
        <div class="product-card__image-container">
            <img class="product-card__image" src="${product.image || ""}" alt="${product.title || ""}">
        </div>
        <h3 class="product-card__title">${product.title || ""}</h3>
        <div class="product-card__buying-section" >
            <p class="product-card__price">
                ${product.price ? `${product.price} ₽` : ""}
            </p>
            <button type="button" class="product-card__add-to-cart-btn" id="addToCartButton"></button>
        </div>
      </div>
    `;

    this.addToCartButton = this.shadowRoot.getElementById("addToCartButton");
    this.productCard = this.shadowRoot.getElementById("product-card");

    this.productCard.addEventListener("mouseover", () => {
      this.addToCartButton.classList.add(
        "product-card__add-to-cart-btn_visible",
      );
    });
    this.productCard.addEventListener("mouseout", () => {
      this.addToCartButton.classList.remove(
        "product-card__add-to-cart-btn_visible",
      );
    });

    this.addToCartButton.addEventListener("click", () => {
      const product = JSON.parse(this.getAttribute("product"));
      cartService.addItem(product);

      // Анимация добавления
      this.addToCartButton.classList.add(
        "product-card__add-to-cart-btn--active",
      );
      setTimeout(() => {
        this.addToCartButton.classList.remove(
          "product-card__add-to-cart-btn--active",
        );
      }, 500);
    });
  }

  _getStatusText(status) {
    const statusMap = {
      new: "Новинка",
      in_stock: "В наличии",
      contract: "Контрактный",
      exclusive: "Эксклюзив",
      sale: "Распродажа",
    };
    return statusMap[status] || status || "";
  }
}

customElements.define("site-product-card", SiteProductCard);

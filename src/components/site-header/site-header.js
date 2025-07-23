import { loadStyles } from "../../utils/helpers.js";
import { cartService } from "../../utils/cart-service.js";

class SiteHeader extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  async connectedCallback() {
    await this.render();
  }

  async render() {
    const styles = await loadStyles("site-header");
    
    // Используем шаблонную строку с корректным местом для счетчика
    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <header class="site-header">
        <button
          type="button"
          class="site-header__side-menu-button site-header__button"
          id="side-menu-button"
        >
          <img src="src/images/icons/side-menu-icon.png" alt="menu-icon" class="site-header__button-icon" />
        </button>
        <div class="site-header__nav-container">
          <a href="/" class="site-header__logo-container">
            <img src="src/images/ColorsLogo.svg" alt="Colors Logo" class="site-header__logo-image" />
          </a>
          <nav class="site-header__nav" id="nav"></nav>
        </div>
        <div class="site-header__utils-container">
          <div class="site-header__contact" id="contact">
            <a href="tel:+74952217769" class="site-header__contact-tel">+7 (495) 221-77-69</a>
            <p class="site-header__contact-text">Заказать звонок</p>
          </div>
          <div class="site-header__buttons-container">
            <ul class="site-header__buttons-list" id="buttons-list"></ul>
            <button
              type="button"
              class="site-header__button"
              id="cart-button"
            >
              <span class="site-header__cart-count" id="cart-count"></span>
            </button>
          </div>
        </div>
      </header>
    `;

    this.renderContent();
  }
  
  renderContent() {
    const nav = this.shadowRoot.getElementById("nav");
    if (nav) {
      const links = [
        { title: "Продукты", href: "/Products" },
        { title: "Цвета", href: "/colors" },
        { title: "Вдохновение", href: "/inspiration" },
        { title: "Советы", href: "/guides" },
        { title: "Найти магазин", href: "/search-shop" },
      ];
      
      nav.innerHTML = links.map(link => 
        `<a href="${link.href}" class="site-header__nav-link">${link.title.toUpperCase()}</a>`
      ).join("");
    }

    const buttonsList = this.shadowRoot.getElementById("buttons-list");
    if (buttonsList) {
      const buttons = ["search", "profile", "favourite"];
      buttonsList.innerHTML = buttons.map(button => `
        <li class="site-header__buttons-list-item">
          <button type="button" class="site-header__button" id="${button}-button">
            <img src="src/images/icons/${button}-icon.png" alt="${button} icon" class="site-header__button-icon" />
          </button>
        </li>
      `).join("");
    }

    this.sideMenuButton = this.shadowRoot.getElementById("side-menu-button");
    this.cartButton = this.shadowRoot.getElementById("cart-button");
    this.cartCountEl = this.shadowRoot.getElementById("cart-count");

    this.sideMenuButton.addEventListener("click", () => {
      document.querySelector('site-drawer[direction="left"]').open();
    });

    this.cartButton.addEventListener("click", () => {
      document.querySelector('site-drawer[direction="right"]').open();
    });

    this.updateCartCount();

    window.addEventListener("cart-updated", () => this.updateCartCount());
  }

  updateCartCount() {
    const count = cartService.getTotalCount();
    const hasItems = count > 0;
    
    // Обновляем счетчик
    this.cartCountEl.textContent = hasItems ? count : 0;
  }
}

customElements.define("site-header", SiteHeader);
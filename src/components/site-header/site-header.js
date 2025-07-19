import { loadStyles } from "../../utils/helpers.js";
import api from "../../utils/api.js"; // Ensure API is imported for potential use

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

    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <header class="site-header">
        <button
          type="button"
          class="site-header__side-menu-button site-header__button"
          id="side-menu-button"
        >
          <img src="src/images/icons/side-menu-icon.png" alt="cart-icon" class="site-header__button-icon" />
        </button>
        <div class="site-header__nav-container">
          <a href="/" class="site-header__logo-container">
            <img src="" class="site-header__logo-image" id="logo-img" />
          </a>
          <nav class="site-header__nav" id="nav"></nav>
        </div>
        <div class="site-header__utils-container">
          <div class="site-header__contact" id="contact"></div>
          <div class="site-header__buttons-container">
            <ul class="site-header__buttons-list" id="buttons-list"></ul>
            <button
              type="button"
              class="site-header__button"
              id="cart-button"
            >
              <img src="src/images/icons/cart-icon.png" alt="cart-icon" class="site-header__button-icon" />
            </button>
          </div>
        </div>
      </header>
    `;

    this.renderContent();
  }
  renderContent() {
    const logoImg = this.shadowRoot.getElementById("logo-img");
    logoImg.src = "src/images/ColorsLogo.svg";
    logoImg.alt = "Colors Logo";

    const nav = this.shadowRoot.getElementById("nav");
    if (nav) {
      const links = [
        {
          title: "Продукты",
          href: "/Products",
        },
        {
          title: "Цвета",
          href: "/colors",
        },
        {
          title: "Вдохновение",
          href: "/inspiration",
        },
        {
          title: "Советы",
          href: "/guides",
        },
        {
          title: "Найти магазин",
          href: "/search-shop",
        },
      ];
      nav.innerHTML = links
        .map(
          (link) => `
        <a href="${link.href}" class="site-header__nav-link">${link.title.toUpperCase()}</a>
      `,
        )
        .join("");
    }

    const contact = this.shadowRoot.getElementById("contact");
    if (contact) {
      contact.innerHTML = `
        <a href="tel:+74952217769" class="site-header__contact-tel">+7 (495) 221-77-69</a>
        <p class="site-header__contact-text">Заказать звонок</p>
        `;
    }

    const buttonsList = this.shadowRoot.getElementById("buttons-list");
    if (buttonsList) {
      const buttons = [
        {
          type: "search",
        },
        {
          type: "profile",
        },
        {
          type: "favourite",
        }
      ];
      buttonsList.innerHTML = buttons
        .map(
          (button) => `
        <li class="site-header__buttons-list-item">
          <button type="button" class="site-header__button" id="${button.type}-button">
            <img src="src/images/icons/${button.type}-icon.png" alt="${button.type} icon" class="site-header__button-icon" />
          </button>
        </li>
      `,
        )
        .join("");
    }
  }
}

customElements.define("site-header", SiteHeader);

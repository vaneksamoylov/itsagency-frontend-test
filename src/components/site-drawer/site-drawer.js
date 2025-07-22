import { loadStyles } from "../../utils/helpers.js";

class SiteDrawer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._isOpen = false;
    this._overlay = null;
    this._closeBtn = null;
    this._drawerElement = null;
  }

  static get observedAttributes() {
    return ["direction"];
  }

  async connectedCallback() {
    const styles = await loadStyles("site-drawer");
    const direction = this.getAttribute("direction") || "left";
    
    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <div class="site-drawer site-drawer--${direction}">
        <div class="site-drawer__header">
          <slot class="site-drawer__header-slot" name="header"></slot>
          <h3 class=""></h3>
          <button class="site-drawer__close-btn" id="site-drawer__close-button">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        <div class="site-drawer__content">
          <slot class="site-drawer__content-slot" name="content"></slot>
        </div>
      </div>
    `;

    this._drawerElement = this.shadowRoot.querySelector(".site-drawer");
    
    this._overlay = document.createElement("div");
    this._overlay.className = "site-drawer-overlay";
    document.body.appendChild(this._overlay);

    this._closeBtn = this.shadowRoot.getElementById("site-drawer__close-button");
    this._setupEventListeners();
    this.close();
  }

  disconnectedCallback() {
    if (this._overlay && this._overlay.parentNode === document.body) {
      document.body.removeChild(this._overlay);
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "direction" && oldValue !== newValue && this._drawerElement) {
      this._updateDirectionClass(newValue);
    }
  }

  _updateDirectionClass(direction) {
    // Удаляем только классы направлений
    this._drawerElement.classList.remove("site-drawer--left", "site-drawer--right");
    // Добавляем новый класс направления
    this._drawerElement.classList.add(`site-drawer--${direction || "left"}`);
  }

  open() {
    this._isOpen = true;
    if (this._drawerElement) {
      this._drawerElement.classList.add("site-drawer--open");
    }
    this._overlay.classList.add("site-drawer-overlay--visible");
    document.body.style.overflow = "hidden";
    this.dispatchEvent(new CustomEvent("site-drawer-open", { bubbles: true }));
  }

  close() {
    this._isOpen = false;
    if (this._drawerElement) {
      this._drawerElement.classList.remove("site-drawer--open");
    }
    this._overlay.classList.remove("site-drawer-overlay--visible");
    document.body.style.overflow = "";
    this.dispatchEvent(new CustomEvent("site-drawer-close", { bubbles: true }));
  }

  toggle() {
    this._isOpen ? this.close() : this.open();
  }

  _setupEventListeners() {
    this._closeBtn.addEventListener("click", () => this.close());
    this._overlay.addEventListener("click", () => this.close());
  }
}

customElements.define("site-drawer", SiteDrawer);
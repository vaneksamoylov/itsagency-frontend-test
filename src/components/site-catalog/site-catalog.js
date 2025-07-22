import { loadStyles } from "../../utils/helpers.js";
import api from "../../utils/api.js";

class SiteCatalog extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.products = [];
    this.filteredProducts = [];
    this.activeFilters = new Set();
    this.sortOption = "price_desc";
    this._overlay = null;
    this._isOpen = false;
    this._isSortOpen = false;
    this._handleResize = this._handleResize.bind(this);
    this.resizeObserver = new ResizeObserver(() => this._handleResize());
  }

  async connectedCallback() {
    const styles = await loadStyles("site-catalog");
    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <section class="catalog">
        <aside class="catalog__filters" id="filtersPanel">
          <div class="catalog__filter-group">
            <label class="catalog__filter">
              <input type="checkbox" name="status" value="new">
              <span class="catalog__checkmark"></span>
              <span class="catalog__filter-title">Новинки</span>
            </label>
            <label class="catalog__filter">
              <input type="checkbox" name="status" value="in_stock">
              <span class="catalog__checkmark"></span>
              <span class="catalog__filter-title">Есть в наличии</span>
            </label>
            <label class="catalog__filter">
              <input type="checkbox" name="status" value="contract">
              <span class="catalog__checkmark"></span>
              <span class="catalog__filter-title">Контрактные</span>
            </label>
            <label class="catalog__filter">
              <input type="checkbox" name="status" value="exclusive">
              <span class="catalog__checkmark"></span>
              <span class="catalog__filter-title">Эксклюзивные</span>
            </label>
            <label class="catalog__filter">
              <input type="checkbox" name="status" value="sale">
              <span class="catalog__checkmark"></span>
              <span class="catalog__filter-title">Распродажа</span>
            </label>
          </div>
        </aside>
        
        <div class="catalog__main">        
            <div class="catalog__header">
                <div class="catalog__header-group">
                    <button class="catalog__filter-toggle" id="filterToggle">
                      фильтры
                    </button>
                    <div class="catalog__count" id="productCount"></div>
                </div>
                <div class="catalog__sort">
                  <button class="catalog__sort-button" id="sortButton">
                    <span id="sortButtonText">Сначала дорогие</span>
                    <img src="./src/images/icons/select-arrow-icon.png" alt="select-arrow-icon" />
                  </button>
                  <ul class="catalog__sort-list" id="sortList">
                    <li data-value="price_desc" class="catalog__sort-selected">Сначала дорогие</li>
                    <li data-value="price_asc">Сначала недорогие</li>
                    <li data-value="name_asc">Сначала популярные</li>
                    <li data-value="new_first">Сначала новые</li>
                  </ul>
                </div>
            </div>

            <div class="catalog__products" id="productsContainer"></div>
        </div>
      </section>
    `;

    this.filtersPanel = this.shadowRoot.getElementById("filtersPanel");
    this.productsContainer =
      this.shadowRoot.getElementById("productsContainer");
    this.productCount = this.shadowRoot.getElementById("productCount");
    this.filterToggle = this.shadowRoot.getElementById("filterToggle");

    this.sortButton = this.shadowRoot.getElementById("sortButton");
    this.sortButtonText = this.shadowRoot.getElementById("sortButtonText");
    this.sortList = this.shadowRoot.getElementById("sortList");

    // Создаем оверлей
    this._overlay = document.createElement("div");
    this._overlay.className = "site-catalog-overlay";
    document.body.appendChild(this._overlay);

    this._setupEventListeners();
    this._loadProducts();

    window.addEventListener("resize", this._handleResize);
    this.resizeObserver.observe(this.productsContainer);
  }

  disconnectedCallback() {
    // Удаляем оверлей и обработчики при удалении компонента
    if (this._overlay && document.body.contains(this._overlay)) {
      document.body.removeChild(this._overlay);
    }

    if (this._keydownHandler) {
      document.removeEventListener("keydown", this._keydownHandler);
    }

    window.removeEventListener("resize", this._handleResize);
    this.resizeObserver.disconnect();
  }

  _handleResize() {
    clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => {
      this._updateLastRowStyles();
    }, 100);
  }

  open() {
    if (this._isSortOpen) {
      this.closeSortList(); // Закрываем селект если открыт
    }
    
    this._isOpen = true;
    this.filtersPanel.classList.add("catalog__filters--active");
    
    // Показываем оверлей
    this._overlay.classList.add("site-catalog-overlay--visible");
    document.body.style.overflow = "hidden";
    
    this.dispatchEvent(
      new CustomEvent("catalog-filters-open", { bubbles: true }),
    );
  }

  close() {
    this._isOpen = false;
    this.filtersPanel.classList.remove("catalog__filters--active");
    
    // Скрываем оверлей, если не открыт селект
    if (!this._isSortOpen) {
      this._overlay.classList.remove("site-catalog-overlay--visible");
      document.body.style.overflow = "";
    }
    
    this.dispatchEvent(
      new CustomEvent("catalog-filters-close", { bubbles: true }),
    );
  }

  toggle() {
    if (this._isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  async _loadProducts() {
    try {
      this.products = await api.getProducts();
      this._applyFilters();
      this._renderProducts();

      setTimeout(() => this._updateLastRowStyles(), 0);
    } catch (error) {
      console.error("Ошибка загрузки продуктов:", error);
    }
  }

  _setupEventListeners() {
    // Обработчики фильтров
    const filterInputs = this.shadowRoot.querySelectorAll(
      'input[name="status"]',
    );
    filterInputs.forEach((input) => {
      input.addEventListener("change", this._handleFilterChange.bind(this));
    });

    // Переключение фильтров на мобильных
    this.filterToggle.addEventListener("click", () => {
      this.toggle();
    });

    // Обработчик закрытия по ESC
    this._keydownHandler = (e) => {
      if (e.key === 'Escape') {
        if (this._isOpen) this.close();
        if (this._isSortOpen) this.closeSortList();
      }
    };
    
    document.addEventListener("keydown", this._keydownHandler);

    this.sortButton.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggleSortList();
    });

    this.sortList.addEventListener("click", (e) => {
      if (e.target.tagName === "LI") {
        const value = e.target.dataset.value;
        this.sortOption = value;
        this.sortList.querySelectorAll("li").forEach((li) => {
          li.classList.remove("catalog__sort-selected");
        });

        // Добавляем выделение выбранному элементу
        e.target.classList.add("catalog__sort-selected");
        this.sortButtonText.textContent = e.target.textContent;
        this.closeSortList();
        this._applyFilters();
      }
    });

    // Закрытие списка при клике вне элемента
    document.addEventListener("click", (e) => {
      if (!this.sortList.contains(e.target) && e.target !== this.sortButton) {
        this.closeSortList();
      }
    });

    // Общий обработчик клика для закрытия по оверлею
    this._overlay.addEventListener("click", () => {
      if (this._isOpen) this.close();
      if (this._isSortOpen) this.closeSortList();
    });
  }

  _handleFilterChange(e) {
    const value = e.target.value;
    if (e.target.checked) {
      this.activeFilters.add(value);
    } else {
      this.activeFilters.delete(value);
    }
    this._applyFilters();
  }

  _applyFilters() {
    const filterConditions = {
      new: (product) => product.status === "new",
      in_stock: (product) => product.count > 0,
      contract: (product) => product.status === "contract",
      exclusive: (product) => product.status === "exclusive",
      sale: (product) => product.status === "sale",
    };

    // Фильтрация с учетом всех активных условий
    this.filteredProducts = this.products.filter((product) => {
      // Если нет активных фильтров - показываем все товары
      if (this.activeFilters.size === 0) return true;

      // Проверяем все активные фильтры (логическое И)
      for (const filter of this.activeFilters) {
        if (filterConditions[filter] && !filterConditions[filter](product)) {
          return false;
        }
      }
      return true;
    });

    this._sortProducts();
    this._renderProducts();
  }

  toggleSortList() {
    if (this._isSortOpen) {
      this.closeSortList();
    } else {
      this.openSortList();
    }
  }

  openSortList() {
    if (this._isOpen) {
      this.close(); // Закрываем фильтры если открыты
    }
    
    this._isSortOpen = true;
    this.sortList.classList.add('catalog__sort-list--open');
    this.sortButton.classList.add('catalog__sort-button--active');
    
    // Показываем оверлей
    this._overlay.classList.add("site-catalog-overlay--visible");
    document.body.style.overflow = "hidden";
  }

  closeSortList() {
    this._isSortOpen = false;
    this.sortList.classList.remove('catalog__sort-list--open');
    this.sortButton.classList.remove('catalog__sort-button--active');
    
    // Скрываем оверлей, если не открыты фильтры
    if (!this._isOpen) {
      this._overlay.classList.remove("site-catalog-overlay--visible");
      document.body.style.overflow = "";
    }
  }

  _sortProducts() {
    switch (this.sortOption) {
      case "price_asc":
        this.filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        this.filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case "popular":
        this.filteredProducts;
        break;
      case "new_first":
        this.filteredProducts.sort((a, b) => {
          // Оба товара новые - сохраняем порядок
          if (a.status === "new" && b.status === "new") return 0;
          // Только a новый - помещаем выше
          if (a.status === "new") return -1;
          // Только b новый - помещаем ниже
          if (b.status === "new") return 1;
          // Оба не новые - сохраняем порядок
          return 0;
        });
        break;
    }
  }

  _renderProducts() {
    this.productCount.textContent = this._pluralizeProducts(
      this.filteredProducts.length,
    ).toUpperCase();
    this.productsContainer.innerHTML = "";

    this.filteredProducts.forEach((product) => {
      const card = document.createElement("site-product-card");
      card.setAttribute("product", JSON.stringify(product));
      this.productsContainer.appendChild(card);
    });

    setTimeout(() => this._updateLastRowStyles(), 0);
  }

  _pluralizeProducts(count) {
    if (count % 100 >= 11 && count % 100 <= 19) {
      return `${count} товаров`;
    }

    const lastDigit = count % 10;
    switch (lastDigit) {
      case 1:
        return `${count} товар`;
      case 2:
      case 3:
      case 4:
        return `${count} товара`;
      default:
        return `${count} товаров`;
    }
  }

  _updateLastRowStyles() {
    const container = this.productsContainer;
    const items = container.querySelectorAll("site-product-card");

    // Удаляем предыдущие классы
    items.forEach((item) => item.classList.remove("last-row-item"));

    if (items.length === 0) return;

    // Определяем количество колонок
    const containerStyle = window.getComputedStyle(container);
    const columnCount = containerStyle.gridTemplateColumns.split(" ").length;

    // Рассчитываем элементы последней строки
    const lastRowItemCount = items.length % columnCount || columnCount;
    const startIndex = items.length - lastRowItemCount;

    // Добавляем класс
    for (let i = startIndex; i < items.length; i++) {
      items[i].classList.add("last-row-item");
    }
  }
}

customElements.define("site-catalog", SiteCatalog);

import { loadStyles } from "../../utils/helpers.js";

// Глобальный флаг для отслеживания загрузки стилей
let stylesLoaded = false;

class SiteSlider extends HTMLElement {
  constructor() {
    super();
    this._swiperInstance = null;
    this._uniqueId = `slider-${Math.random().toString(36).slice(2, 11)}`;
  }

  async connectedCallback() {
    // Сохраняем исходные слайды ДО изменения DOM
    const originalSlides = Array.from(this.children);
    
    // Загружаем стили
    if (!stylesLoaded) {
      const styles = await loadStyles('site-slider');
      if (styles) {
        const styleTag = document.createElement('style');
        styleTag.id = 'site-slider-styles';
        styleTag.textContent = styles;
        document.head.appendChild(styleTag);
        stylesLoaded = true;
      }
    }
    
    // Создаем структуру компонента
    this.render();
    
    // Вставляем сохраненные слайды
    const wrapper = this.querySelector(`.${this._classes.wrapper}`);
    originalSlides.forEach(slide => {
      slide.classList.add('swiper-slide', this._classes.slide);
      wrapper.appendChild(slide);
    });
    
    // Инициализируем Swiper
    setTimeout(() => this.initSwiper(), 0);
  }

  render() {
    // Генерируем уникальные классы
    this._classes = {
      container: `${this._uniqueId}-container`,
      wrapper: `${this._uniqueId}-wrapper`,
      pagination: `${this._uniqueId}-pagination`,
      prev: `${this._uniqueId}-prev`,
      next: `${this._uniqueId}-next`,
      slide: `${this._uniqueId}-slide`
    };
    
    // Создаем структуру слайдера
    this.innerHTML = `
      <div class="site-slider-container ${this._classes.container}">
        <div class="swiper">
          <div class="swiper-wrapper ${this._classes.wrapper}"></div>
          <div class="swiper-pagination ${this._classes.pagination}"></div>
          <div class="swiper-button-prev ${this._classes.prev}"></div>
          <div class="swiper-button-next ${this._classes.next}"></div>
        </div>
      </div>
    `;
  }

  initSwiper() {
    this._swiperInstance = new Swiper(this.querySelector(`.${this._classes.container} .swiper`), {
      loop: true,
      speed: 600,
      grabCursor: true,
      centeredSlides: true,
      slidesPerView: 'auto',
      effect: 'coverflow',
      coverflowEffect: {
        rotate: 20,
        stretch: 0,
        depth: 100,
        modifier: 1,
        slideShadows: true,
        scale: 1
      },
      pagination: {
        el: `.${this._classes.pagination}`,
        clickable: true,
      },
      navigation: {
        nextEl: `.${this._classes.next}`,
        prevEl: `.${this._classes.prev}`,
      }
    });
  }

  disconnectedCallback() {
    if (this._swiperInstance) {
      this._swiperInstance.destroy(true, true);
      this._swiperInstance = null;
    }
  }

  // Обновление слайдера
  updateSwiper() {
    if (this._swiperInstance) {
      this._swiperInstance.update();
      this._swiperInstance.slideTo(0);
    }
  }
}

customElements.define('site-slider', SiteSlider);
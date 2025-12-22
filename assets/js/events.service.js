/**
 * Общий сервис для работы с мероприятиями (events)
 * Предоставляет функции загрузки данных и рендеринга карточек
 */

// Кэш для загруженных данных
let eventsCache = null;

/**
 * Загружает данные мероприятий из JSON файла
 * @returns {Promise<Array>} Массив мероприятий
 */
async function loadEventsData() {
  if (eventsCache) {
    return eventsCache;
  }

  try {
    const response = await fetch('data/events.json');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    eventsCache = Array.isArray(data) ? data : [];
    return eventsCache;
  } catch (error) {
    console.error('Не удалось загрузить данные мероприятий:', error);
    return [];
  }
}

/**
 * Форматирует цену для отображения
 * @param {Object} price - Объект с данными цены
 * @returns {string} Отформатированная строка цены
 */
function formatPrice(price) {
  if (!price || price.value === undefined || price.value === null || price.value === '') {
    return '';
  }

  const value = typeof price.value === 'number' 
    ? new Intl.NumberFormat('ru-RU').format(price.value)
    : String(price.value);
  
  const prefix = price.prefix || '';
  const suffix = price.suffix || '';
  const unitLabel = price.unitLabel ? ` / ${price.unitLabel}` : '';
  
  // Если currency не указана, не добавляем её (предполагаем, что она уже в value)
  if (!price.currency || price.currency === '') {
    return `${prefix}${value}${unitLabel}${suffix}`;
  }
  
  const currency = price.currency;
  return `${prefix}${value} ${currency}${unitLabel}${suffix}`;
}

/**
 * Рендерит карточку мероприятия
 * @param {Object} event - Объект мероприятия
 * @returns {HTMLElement} DOM элемент карточки
 */
function renderEventCard(event) {
  if (!event || !event.id || !event.title) {
    return null;
  }

  const article = document.createElement('article');
  article.className = 'flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-surface-dark shadow-sm border border-gray-100 dark:border-white/5 group transition-all hover:shadow-md';

  // Hero Image Section
  const heroSection = document.createElement('div');
  heroSection.className = 'relative h-56 w-full overflow-hidden';

  const imageBg = document.createElement('div');
  imageBg.className = 'absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105';
  imageBg.style.backgroundImage = `url('${event.heroImage || ''}')`;
  if (event.title) {
    imageBg.setAttribute('data-alt', event.title);
  }

  const gradientOverlay = document.createElement('div');
  gradientOverlay.className = 'absolute inset-0 bg-gradient-to-t from-surface-dark via-surface-dark/40 to-transparent opacity-90 dark:opacity-80';

  heroSection.appendChild(imageBg);
  heroSection.appendChild(gradientOverlay);

  // Content Section
  const contentSection = document.createElement('div');
  contentSection.className = 'relative -mt-12 px-5 pb-5 pt-0 flex flex-col gap-4';

  // Title
  const titleRow = document.createElement('div');
  titleRow.className = 'flex justify-between items-end';
  const title = document.createElement('h3');
  title.className = 'text-2xl font-bold text-white leading-tight';
  title.textContent = event.title || '';
  titleRow.appendChild(title);
  contentSection.appendChild(titleRow);

  // Included items preview (первые 3 элемента из included)
  if (Array.isArray(event.included) && event.included.length > 0) {
    const includedPreview = document.createElement('div');
    includedPreview.className = 'flex flex-col gap-3';
    
    event.included.slice(0, 3).forEach((item) => {
      if (item && item.title) {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'flex items-center gap-3 text-gray-300';
        
        const icon = document.createElement('span');
        icon.className = 'material-symbols-outlined text-primary';
        // Определяем иконку по содержимому или используем дефолтную
        if (item.title.toLowerCase().includes('музык')) {
          icon.textContent = 'music_note';
        } else if (item.title.toLowerCase().includes('торт') || item.title.toLowerCase().includes('десерт')) {
          icon.textContent = 'cake';
        } else if (item.title.toLowerCase().includes('вин')) {
          icon.textContent = 'wine_bar';
        } else if (item.title.toLowerCase().includes('сигар')) {
          icon.textContent = 'smoking_rooms';
        } else if (item.title.toLowerCase().includes('игр') || item.title.toLowerCase().includes('казино')) {
          icon.textContent = 'emoji_events';
        } else if (item.title.toLowerCase().includes('лекц') || item.title.toLowerCase().includes('мастер')) {
          icon.textContent = 'record_voice_over';
        } else {
          icon.textContent = 'restaurant_menu';
        }
        
        const text = document.createElement('span');
        text.className = 'text-sm font-medium';
        text.textContent = item.title;
        
        itemDiv.appendChild(icon);
        itemDiv.appendChild(text);
        includedPreview.appendChild(itemDiv);
      }
    });
    
    contentSection.appendChild(includedPreview);
  }

  // Price and CTA
  const footer = document.createElement('div');
  footer.className = 'mt-2 flex items-center justify-between border-t border-white/10 pt-4';

  const priceSection = document.createElement('div');
  priceSection.className = 'flex flex-col';

  if (event.price) {
    const priceLabel = document.createElement('span');
    priceLabel.className = 'text-xs text-gray-400 font-medium uppercase tracking-wider';
    priceLabel.textContent = event.price.unitLabel ? 'Цена за гостя' : 'Цена';
    
    const priceValue = document.createElement('span');
    priceValue.className = 'text-xl font-bold text-primary';
    priceValue.textContent = formatPrice(event.price);
    
    priceSection.appendChild(priceLabel);
    priceSection.appendChild(priceValue);
  }

  const ctaButton = document.createElement('a');
  ctaButton.href = `event-profile.html?id=${event.id}`;
  ctaButton.className = 'inline-flex items-center h-10 px-6 rounded-xl bg-white dark:bg-white text-background-dark text-sm font-bold hover:bg-gray-100 transition-colors';
  ctaButton.textContent = 'Подробнее';

  footer.appendChild(priceSection);
  footer.appendChild(ctaButton);
  contentSection.appendChild(footer);

  // Assemble card
  article.appendChild(heroSection);
  article.appendChild(contentSection);

  return article;
}

/**
 * Рендерит все карточки мероприятий в указанный контейнер
 * @param {string} containerId - ID контейнера для рендеринга
 */
async function renderEventsFeed(containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`Контейнер с ID "${containerId}" не найден`);
    return;
  }

  try {
    const events = await loadEventsData();
    
    container.innerHTML = '';

    if (events.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'col-span-full text-center text-gray-500 dark:text-gray-400 py-8';
      emptyMessage.textContent = 'Мероприятия не найдены';
      container.appendChild(emptyMessage);
      return;
    }

    events.forEach((event) => {
      const card = renderEventCard(event);
      if (card) {
        container.appendChild(card);
      }
    });
  } catch (error) {
    console.error('Ошибка при рендеринге мероприятий:', error);
    container.innerHTML = '<div class="col-span-full text-center text-red-500 py-8">Ошибка загрузки данных</div>';
  }
}

// Экспорт функций для использования в других модулях
if (typeof window !== 'undefined') {
  window.EventsService = {
    loadEventsData,
    renderEventCard,
    renderEventsFeed,
    formatPrice,
  };
}


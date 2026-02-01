/**
 * Скрипт для страницы event-profile.html
 * Загружает данные мероприятия по ID из query string и заполняет шаблон
 * Автоматически скрывает пустые поля и секции
 */

// Получаем значение параметра из query string
function getParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

// Универсальный переключатель видимости элемента
const setVisible = (el, visible) => {
  if (!el) return;
  el.style.display = visible ? '' : 'none';
};

// Записываем текст в элемент или скрываем его, если контента нет
const setTextOrHide = (id, value) => {
  const el = document.getElementById(id);
  if (!el) return false;
  const hasValue = value !== undefined && value !== null && value !== '';
  if (hasValue) {
    el.textContent = value;
    el.style.display = '';
    return true;
  }
  el.textContent = '';
  el.style.display = 'none';
  return false;
};

// Утилита для установки изображения
const setImage = (el, src, alt) => {
  if (!el || !src) {
    if (el) setVisible(el, false);
    return;
  }
  el.src = src;
  if (alt) el.alt = alt;
  setVisible(el, true);
};

// Утилита для установки фонового изображения
const setBgImage = (el, src) => {
  if (!el || !src) {
    if (el) setVisible(el, false);
    return;
  }
  el.style.backgroundImage = `url('${src}')`;
  setVisible(el, true);
};


async function loadEvent() {
  const id = getParam('id');
  if (!id) {
    console.warn('ID мероприятия не указан в URL');
    return;
  }

  try {
    // Проверяем наличие EventsService
    if (!window.EventsService) {
      console.error('EventsService не загружен');
      return;
    }

    const events = await window.EventsService.loadEventsData();
    const event = Array.isArray(events) ? events.find((item) => item.id === id) : null;

    if (!event) {
      console.warn(`Мероприятие с ID "${id}" не найдено`);
      return;
    }

    // Заголовок страницы
    document.title = event.title ? `${event.title} — мероприятие` : 'Мероприятие';

    // Hero Image
    const heroImg = document.getElementById('event-hero-img');
    setImage(heroImg, event.heroImage, event.title);

    // Title
    setTextOrHide('event-title', event.title);

    // Price
    const priceBlock = document.getElementById('event-price-block');
    const priceValue = document.getElementById('event-price-value');
    const priceUnit = document.getElementById('event-price-unit');

    if (event.price && priceValue && priceUnit) {
      if (event.price.value !== undefined && event.price.value !== null && event.price.value !== '') {
        const value = typeof event.price.value === 'number'
          ? new Intl.NumberFormat('ru-RU').format(event.price.value)
          : String(event.price.value);

        const prefix = event.price.prefix || '';
        const currency = event.price.currency || '₽';
        const suffix = event.price.suffix || '';

        priceValue.textContent = `${prefix}${value} ${currency}${suffix}`;

        if (event.price.unitLabel) {
          priceUnit.textContent = `/ ${event.price.unitLabel}`;
          setVisible(priceUnit, true);
        } else {
          setVisible(priceUnit, false);
        }

        setVisible(priceBlock, true);
      } else {
        setVisible(priceBlock, false);
      }
    } else {
      setVisible(priceBlock, false);
    }

    // Description
    const descriptionBlock = document.getElementById('event-description-block');
    const descriptionEl = document.getElementById('event-description');
    if (descriptionBlock && descriptionEl) {
      if (event.description) {
        descriptionEl.textContent = event.description;
        setVisible(descriptionBlock, true);
      } else {
        setVisible(descriptionBlock, false);
      }
    }

    // Chips
    const chipsBlock = document.getElementById('event-chips-block');
    const chipsContainer = document.getElementById('event-chips');
    if (chipsBlock && chipsContainer) {
      if (Array.isArray(event.chips) && event.chips.length > 0) {
        chipsContainer.innerHTML = '';
        event.chips.forEach((chip) => {
          if (chip && chip.text) {
            const chipEl = document.createElement('div');
            chipEl.className = 'flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white dark:bg-[#393028] border border-slate-200 dark:border-transparent px-4 shadow-sm';

            if (chip.icon) {
              const icon = document.createElement('span');
              icon.className = 'material-symbols-outlined text-primary text-[18px]';
              icon.textContent = chip.icon;
              chipEl.appendChild(icon);
            }

            const text = document.createElement('p');
            text.className = 'text-slate-700 dark:text-white text-sm font-medium';
            text.textContent = chip.text;
            chipEl.appendChild(text);

            chipsContainer.appendChild(chipEl);
          }
        });
        setVisible(chipsBlock, true);
      } else {
        setVisible(chipsBlock, false);
      }
    }

    // Included Services
    const includedBlock = document.getElementById('event-included-block');
    const includedContainer = document.getElementById('event-included');
    if (includedBlock && includedContainer) {
      if (Array.isArray(event.included) && event.included.length > 0) {
        includedContainer.innerHTML = '';
        event.included.forEach((item) => {
          if (item && item.title) {
            const itemEl = document.createElement('div');
            itemEl.className = 'flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-white/5 border border-slate-100 dark:border-transparent';

            const iconWrapper = document.createElement('div');
            iconWrapper.className = 'flex items-center justify-center size-8 rounded-full bg-primary/20 text-primary shrink-0';
            const icon = document.createElement('span');
            icon.className = 'material-symbols-outlined text-sm font-bold';
            icon.textContent = 'check';
            iconWrapper.appendChild(icon);

            const content = document.createElement('div');
            content.className = 'flex flex-col';

            const title = document.createElement('span');
            title.className = 'text-sm font-bold text-slate-900 dark:text-white';
            title.textContent = item.title;
            content.appendChild(title);

            if (item.description) {
              const desc = document.createElement('span');
              desc.className = 'text-xs text-slate-500 dark:text-gray-400';
              desc.textContent = item.description;
              content.appendChild(desc);
            }

            itemEl.appendChild(iconWrapper);
            itemEl.appendChild(content);
            includedContainer.appendChild(itemEl);
          }
        });
        setVisible(includedBlock, true);
      } else {
        setVisible(includedBlock, false);
      }
    }

    // Extras (Additional Services)
    const extrasBlock = document.getElementById('event-extras-block');
    const extrasContainer = document.getElementById('event-extras');
    if (extrasBlock && extrasContainer) {
      if (Array.isArray(event.extras) && event.extras.length > 0) {
        extrasContainer.innerHTML = '';
        event.extras.forEach((extra, index) => {
          if (extra && extra.title) {
            const itemEl = document.createElement('div');
            itemEl.className = 'flex items-center justify-between py-4';

            const leftSection = document.createElement('div');
            leftSection.className = 'flex items-center gap-3';

            const iconWrapper = document.createElement('div');
            iconWrapper.className = 'size-10 rounded-lg bg-slate-100 dark:bg-[#393028] flex items-center justify-center text-slate-500 dark:text-gray-400';
            const icon = document.createElement('span');
            icon.className = 'material-symbols-outlined';
            icon.textContent = extra.icon || 'add';
            iconWrapper.appendChild(icon);

            const content = document.createElement('div');
            content.className = 'flex flex-col';

            const title = document.createElement('span');
            title.className = 'text-sm font-medium text-slate-900 dark:text-white';
            title.textContent = extra.title;
            content.appendChild(title);

            if (extra.price) {
              const priceText = window.EventsService.formatPrice(extra.price);
              if (priceText) {
                const priceEl = document.createElement('span');
                priceEl.className = 'text-xs text-primary font-bold';
                priceEl.textContent = priceText;
                content.appendChild(priceEl);
              }
            }

            leftSection.appendChild(iconWrapper);
            leftSection.appendChild(content);
            itemEl.appendChild(leftSection);

            extrasContainer.appendChild(itemEl);
          }
        });
        setVisible(extrasBlock, true);
      } else {
        setVisible(extrasBlock, false);
      }
    }
    // Настройка кнопки "Назад"
    const backButton = document.getElementById('back-button');
    if (backButton) {
      backButton.onclick = (e) => {
        e.preventDefault();
        // Пытаемся вернуться назад по истории, если это наш сайт
        if (window.history.length > 1 && document.referrer.includes(window.location.host)) {
          window.history.back();
        } else {
          // Если истории нет, возвращаемся на главную
          window.location.href = 'index.html';
        }
      };
    }
  } catch (error) {
    console.error('Не удалось загрузить данные мероприятия', error);
  }
}

// Запускаем наполнение страницы после загрузки DOM
document.addEventListener('DOMContentLoaded', loadEvent);


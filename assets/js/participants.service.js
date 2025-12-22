/**
 * Общий сервис для работы с участниками (participants)
 * Предоставляет функции загрузки данных и фильтрации по категориям
 */

// Кэш для загруженных данных
let participantsCache = null;

/**
 * Загружает данные участников из JSON файла
 * @returns {Promise<Array>} Массив участников
 */
async function loadParticipantsData() {
  if (participantsCache) {
    return participantsCache;
  }

  try {
    const response = await fetch('data/participants.json');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    participantsCache = Array.isArray(data) ? data : [];
    return participantsCache;
  } catch (error) {
    console.error('Не удалось загрузить данные участников:', error);
    return [];
  }
}

/**
 * Нормализует строку категории (убирает пробелы, приводит к единому формату)
 * @param {string} category - Категория для нормализации
 * @returns {string} Нормализованная категория
 */
function normalizeCategory(category) {
  if (!category || typeof category !== 'string') {
    return '';
  }
  return category.trim();
}

/**
 * Фильтрует участников по категории
 * @param {Array} participants - Массив участников
 * @param {string|Array<string>} categories - Категория или массив категорий для фильтрации
 * @returns {Array} Отфильтрованный массив участников
 */
function filterByCategory(participants, categories) {
  if (!Array.isArray(participants)) {
    return [];
  }

  const categoryList = Array.isArray(categories) ? categories : [categories];
  const normalizedCategories = categoryList.map(normalizeCategory).filter(Boolean);

  if (normalizedCategories.length === 0) {
    return [];
  }

  return participants.filter((person) => {
    if (!person || !person.id) {
      return false;
    }

    const personCategory = normalizeCategory(person.category);
    if (!personCategory) {
      return false;
    }

    return normalizedCategories.some((cat) => personCategory === cat);
  });
}

/**
 * Рендерит карточку участника
 * @param {Object} person - Объект участника
 * @param {string} profilePage - URL страницы профиля (по умолчанию participant-profile.html)
 * @returns {HTMLElement} DOM элемент карточки
 */
function renderParticipantCard(person, profilePage = 'participant-profile.html') {
  const card = document.createElement('a');
  card.href = `${profilePage}?id=${person.id}`;
  card.className = 'group relative flex flex-col gap-3 rounded-xl overflow-hidden aspect-[3/4] cursor-pointer';

  const image = document.createElement('div');
  image.className = 'absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110';
  image.style.backgroundImage = `url('${person.cardImage || person.coverImage || ''}')`;

  const overlay = document.createElement('div');
  overlay.className = 'absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent';

  const content = document.createElement('div');
  content.className = 'relative z-10 flex flex-col h-full justify-end p-3';

  const category = document.createElement('p');
  category.className = 'text-primary text-xs font-bold uppercase tracking-wider mb-1';
  category.textContent = person.category || '';

  const name = document.createElement('p');
  name.className = 'text-white text-base font-bold leading-tight';
  name.textContent = person.name || 'Участник';

  content.appendChild(category);
  content.appendChild(name);

  card.appendChild(image);
  card.appendChild(overlay);
  card.appendChild(content);

  return card;
}

/**
 * Фильтрует участников по поисковому запросу
 * Ищет в name, tagline, about и tags
 * @param {Array} participants - Массив участников
 * @param {string} searchQuery - Поисковый запрос
 * @returns {Array} Отфильтрованный массив участников
 */
function filterBySearch(participants, searchQuery) {
  if (!Array.isArray(participants) || !searchQuery || typeof searchQuery !== 'string') {
    return participants;
  }

  const query = searchQuery.toLowerCase().trim();
  if (!query) {
    return participants;
  }

  return participants.filter((person) => {
    if (!person) return false;

    // Поиск по имени
    const name = (person.name || '').toLowerCase();
    if (name.includes(query)) return true;

    // Поиск по tagline
    const tagline = (person.tagline || '').toLowerCase();
    if (tagline.includes(query)) return true;

    // Поиск по описанию
    const about = (person.about || '').toLowerCase();
    if (about.includes(query)) return true;

    // Поиск по тегам
    if (Array.isArray(person.tags)) {
      const hasMatchingTag = person.tags.some((tag) => {
        if (typeof tag === 'string') {
          return tag.toLowerCase().includes(query);
        }
        if (tag && tag.text) {
          return tag.text.toLowerCase().includes(query);
        }
        return false;
      });
      if (hasMatchingTag) return true;
    }

    return false;
  });
}

/**
 * Фильтрует участников по тегу
 * @param {Array} participants - Массив участников
 * @param {string} tagText - Текст тега для фильтрации
 * @returns {Array} Отфильтрованный массив участников
 */
function filterByTag(participants, tagText) {
  if (!Array.isArray(participants) || !tagText || typeof tagText !== 'string') {
    return participants;
  }

  const tag = tagText.trim();
  if (!tag) {
    return participants;
  }

  return participants.filter((person) => {
    if (!person || !Array.isArray(person.tags)) {
      return false;
    }

    return person.tags.some((t) => {
      if (typeof t === 'string') {
        return t === tag;
      }
      if (t && t.text) {
        return t.text === tag;
      }
      return false;
    });
  });
}

/**
 * Рендерит сетку участников в указанный контейнер
 * @param {string} containerId - ID контейнера для рендеринга
 * @param {string|Array<string>} categories - Категория или массив категорий для фильтрации
 * @param {string} profilePage - URL страницы профиля
 * @param {string} searchQuery - Опциональный поисковый запрос
 * @param {string} tagFilter - Опциональный фильтр по тегу
 */
async function renderParticipantsGrid(containerId, categories, profilePage = 'participant-profile.html', searchQuery = '', tagFilter = '') {
  const grid = document.getElementById(containerId);
  if (!grid) {
    console.warn(`Контейнер с ID "${containerId}" не найден`);
    return;
  }

  try {
    const participants = await loadParticipantsData();
    const categoryList = Array.isArray(categories) ? categories : [categories];
    const normalizedCategories = categoryList.map(normalizeCategory).filter(Boolean);

    // Проверяем наличие всех категорий в данных
    const allCategories = new Set(
      participants
        .filter((p) => p && p.category)
        .map((p) => normalizeCategory(p.category))
    );

    const missingCategories = normalizedCategories.filter(
      (cat) => !allCategories.has(cat)
    );

    if (missingCategories.length > 0) {
      console.warn(
        `Категории не найдены в данных: ${missingCategories.join(', ')}. ` +
        `Доступные категории: ${Array.from(allCategories).join(', ')}`
      );
    }

    let filtered = filterByCategory(participants, categories);

    // Применяем фильтр по тегу, если указан
    if (tagFilter) {
      filtered = filterByTag(filtered, tagFilter);
    }

    // Применяем поисковый фильтр, если указан
    if (searchQuery) {
      filtered = filterBySearch(filtered, searchQuery);
    }

    grid.innerHTML = '';

    if (filtered.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'col-span-2 text-center text-white/50 py-8';
      emptyMessage.textContent = 'Участники не найдены';
      grid.appendChild(emptyMessage);
      return;
    }

    filtered.forEach((person) => {
      const card = renderParticipantCard(person, profilePage);
      grid.appendChild(card);
    });
  } catch (error) {
    console.error('Ошибка при рендеринге участников:', error);
    grid.innerHTML = '<div class="col-span-2 text-center text-red-500 py-8">Ошибка загрузки данных</div>';
  }
}

// Экспорт функций для использования в других модулях
if (typeof window !== 'undefined') {
  window.ParticipantsService = {
    loadParticipantsData,
    filterByCategory,
    filterBySearch,
    filterByTag,
    renderParticipantCard,
    renderParticipantsGrid,
    normalizeCategory,
  };
}


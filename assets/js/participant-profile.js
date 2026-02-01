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

// Утилита для установки фонового изображения
const setBgImage = (el, src) => {
  if (!el || !src) return;
  el.style.backgroundImage = `url('${src}')`;
};

// Превращаем обычную ссылку в ссылку для iframe-плеера
// iframe — это "встроенное окошко" внутри страницы, где живёт плеер
function toEmbedUrl(url) {
  if (!url || typeof url !== 'string') return null;

  let u;
  try {
    u = new URL(url);
  } catch {
    return null; // не похоже на URL
  }

  const host = u.hostname.replace(/^www\./, '').toLowerCase();

  // YouTube
  if (host === 'youtu.be') {
    const id = u.pathname.replace('/', '').trim();
    return id ? `https://www.youtube.com/embed/${encodeURIComponent(id)}` : null;
  }
  if (host === 'youtube.com' || host === 'm.youtube.com') {
    // https://www.youtube.com/watch?v=ID
    if (u.pathname === '/watch') {
      const id = u.searchParams.get('v');
      return id ? `https://www.youtube.com/embed/${encodeURIComponent(id)}` : null;
    }
    // https://www.youtube.com/embed/ID
    if (u.pathname.startsWith('/embed/')) {
      return url;
    }
    // https://www.youtube.com/shorts/ID
    if (u.pathname.startsWith('/shorts/')) {
      const id = u.pathname.split('/')[2];
      return id ? `https://www.youtube.com/embed/${encodeURIComponent(id)}` : null;
    }
  }

  // Rutube
  if (host === 'rutube.ru') {
    // Примеры:
    // - https://rutube.ru/video/<id>/
    // - https://rutube.ru/play/embed/<id>
    if (u.pathname.startsWith('/play/embed/')) {
      return url;
    }
    const parts = u.pathname.split('/').filter(Boolean);
    const videoIdx = parts.indexOf('video');
    const id = videoIdx >= 0 ? parts[videoIdx + 1] : null;
    return id ? `https://rutube.ru/play/embed/${encodeURIComponent(id)}` : null;
  }

  return null;
}

// Форматирование чисел для цены
const formatPrice = (price) => new Intl.NumberFormat('ru-RU').format(price);

// Приводим телефон к формату tel: (оставляем только + и цифры)
const toTelHref = (phone) => {
  if (!phone) return '';
  const cleaned = String(phone).trim().replace(/[^\d+]/g, '');
  return cleaned ? `tel:${cleaned}` : '';
};

// Красиво форматируем +7XXXXXXXXXX → +7 (XXX) XXX-XX-XX
const formatRuPhone = (phone) => {
  const cleaned = String(phone || '').replace(/[^\d+]/g, '');
  const m = cleaned.match(/^\+7(\d{3})(\d{3})(\d{2})(\d{2})$/);
  if (!m) return String(phone || '');
  return `+7 (${m[1]}) ${m[2]}-${m[3]}-${m[4]}`;
};

// Разделяем цену и приписку (пример: "150 000 ₽ + 6% ..." → "150 000 ₽" и "+ 6% ...")
function splitPriceAndNote(price, priceNote) {
  const noteFromField = priceNote !== undefined && priceNote !== null ? String(priceNote).trim() : '';

  // price может быть числом, строкой или пустым
  if (typeof price === 'number') {
    return {
      amountText: `${formatPrice(price)} ₽`,
      noteText: noteFromField,
    };
  }

  const raw = price !== undefined && price !== null ? String(price).trim() : '';
  if (!raw) {
    return { amountText: 'По запросу', noteText: noteFromField };
  }

  // Если приписка отдельно задана — используем её, цену оставляем как есть
  if (noteFromField) {
    return { amountText: raw, noteText: noteFromField };
  }

  // Авто-сплит по "+" (для старых значений типа "150 000 ₽ + 6% ...")
  const plusIdx = raw.indexOf('+');
  if (plusIdx > 0) {
    const left = raw.slice(0, plusIdx).trim();
    const right = raw.slice(plusIdx).trim(); // начинается с "+"
    return { amountText: left || raw, noteText: right };
  }

  return { amountText: raw, noteText: '' };
}

// Определяет страницу возврата на основе категории участника
function getBackPageUrl(category) {
  if (!category) return 'service-artists.html';

  const categoryLower = category.toLowerCase();

  // Фотограф → service-photography.html
  if (categoryLower.includes('фотограф')) {
    return 'service-photography.html';
  }

  // Звукорежиссер → service-sound-engeneer.html
  if (categoryLower.includes('звукорежиссер')) {
    return 'service-sound-engeneer.html';
  }

  // Флорист или Декоратор → service-decoration.html
  if (categoryLower.includes('флорист') || categoryLower.includes('декоратор')) {
    return 'service-decoration.html';
  }

  // Техника или Оборудование → service-equipment.html
  if (categoryLower.includes('техника') || categoryLower.includes('оборудование')) {
    return 'service-equipment.html';
  }

  // Все остальные → service-artists.html
  return 'service-artists.html';
}

// Глобальная переменная для хранения данных участника
let currentArtist = null;

async function loadArtist() {
  const id = getParam('id');
  if (!id) return;

  try {
    // Читаем общий JSON со всеми участниками
    const response = await fetch('data/participants.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const artists = await response.json();
    const artist = Array.isArray(artists) ? artists.find((item) => item.id === id) : null;
    if (!artist) return;

    // Сохраняем данные участника для использования в кнопке "назад"
    currentArtist = artist;

    // Заголовки и основные тексты
    document.title = artist.name ? `${artist.name} — профайл` : 'Профайл участника';
    const nameEl = document.getElementById('artist-name');
    if (nameEl) nameEl.textContent = artist.name || 'Участник';

    const taglineEl = document.getElementById('artist-tagline');
    if (taglineEl) {
      setVisible(taglineEl, Boolean(artist.tagline));
      if (artist.tagline) taglineEl.textContent = artist.tagline;
    }

    const categoryShown = setTextOrHide('artist-category', artist.category);
    setVisible(document.getElementById('artist-category-pill'), categoryShown);

    const ratingBlock = document.getElementById('artist-rating-block');
    const hasRating = artist.rating !== undefined && artist.rating !== null && artist.rating !== '';
    const hasReviews = artist.reviews !== undefined && artist.reviews !== null && artist.reviews !== '';
    if (hasRating) setTextOrHide('artist-rating', artist.rating);
    if (hasReviews) setTextOrHide('artist-reviews', `(${artist.reviews})`);
    setVisible(ratingBlock, hasRating || hasReviews);

    const cover = document.getElementById('artist-cover');
    setBgImage(cover, artist.coverImage || artist.cardImage);

    // Теги из массива tags
    const tagsContainer = document.getElementById('artist-tags');
    if (tagsContainer) {
      tagsContainer.innerHTML = '';
      const tags = Array.isArray(artist.tags) ? artist.tags : [];
      if (!tags.length) {
        setVisible(tagsContainer, false);
      } else {
        setVisible(tagsContainer, true);
        tags.forEach((tag) => {
          const el = document.createElement('div');
          el.className =
            'flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full bg-surface-dark border border-white/5 px-4';
          el.innerHTML = `
            <span class="material-symbols-outlined text-primary text-[18px]">${tag.icon || ''}</span>
            <p class="text-white text-sm font-medium">${tag.text || ''}</p>
          `;
          tagsContainer.appendChild(el);
        });
      }
    }

    // Описание
    const aboutBlock = document.getElementById('artist-about-block');
    const aboutEl = document.getElementById('artist-about');
    if (aboutBlock && aboutEl && artist.about) {
      aboutEl.textContent = artist.about;
      setVisible(aboutBlock, true);
    } else {
      setVisible(aboutBlock, false);
    }

    // Портфолио (поддерживаем строки и объекты)
    const portfolioBlock = document.getElementById('artist-portfolio-block');
    const portfolio = document.getElementById('artist-portfolio');
    const shots = Array.isArray(artist.portfolio) ? artist.portfolio : [];
    if (portfolioBlock && portfolio && shots.length) {
      setVisible(portfolioBlock, true);
      portfolio.innerHTML = '';
      portfolio.style.display = 'flex';
      shots.forEach((item) => {
        const shot = typeof item === 'string' ? { src: item } : item;
        const wrapper = document.createElement('div');
        wrapper.className = 'snap-center shrink-0 w-64 aspect-[3/4] rounded-xl overflow-hidden relative';
        wrapper.innerHTML = `
          <div class="w-full h-full bg-cover bg-center transition-transform hover:scale-105 duration-500"
               data-alt="${shot.alt || ''}"
               style="background-image: url('${shot.src || ''}')"></div>
        `;
        portfolio.appendChild(wrapper);
      });
    } else {
      setVisible(portfolioBlock, false);
    }

    // Видео (1+ роликов во встроенном плеере)
    const videoBlock = document.getElementById('artist-video-block');
    const videosContainer = document.getElementById('artist-videos');

    // Данные: videos: [{ src, title, duration }]
    // (Раньше было поле video, но теперь везде используем videos)
    const videosRaw = Array.isArray(artist.videos) ? artist.videos : [];

    // Оставляем только видео с реальной ссылкой
    const videos = videosRaw.filter((v) => v && v.src);

    if (videoBlock && videosContainer && videos.length) {
      setVisible(videoBlock, true);
      videosContainer.innerHTML = '';

      videos.forEach((v) => {
        const embedUrl = toEmbedUrl(v.src);

        const card = document.createElement('div');
        card.className = 'flex flex-col gap-2';

        const frameWrap = document.createElement('div');
        frameWrap.className = 'w-full aspect-video rounded-xl overflow-hidden bg-black/20 border border-white/5 bg-cover bg-center';

        // Если есть постер — ставим его фоном (полезно для состояния загрузки)
        if (v.poster) {
          frameWrap.style.backgroundImage = `url('${v.poster}')`;
        }

        if (embedUrl) {
          // Это Embed (YouTube, Rutube)
          const iframe = document.createElement('iframe');
          iframe.className = 'w-full h-full';
          iframe.src = embedUrl;
          iframe.title = v.title || '';
          iframe.loading = 'lazy';
          iframe.referrerPolicy = 'strict-origin-when-cross-origin';
          iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
          iframe.allowFullscreen = true;
          frameWrap.appendChild(iframe);
        } else {
          // Это локальное видео (mp4 и т.д.)
          const video = document.createElement('video');
          video.className = 'w-full h-full object-cover';
          video.src = v.src;
          // Если есть постер — ставим его и в атрибут, чтобы плеер знал о нем
          if (v.poster) {
            video.poster = v.poster;
          }
          video.controls = true;
          video.playsInline = true;
          video.preload = 'metadata'; // Экономим трафик, грузим только метаданные
          frameWrap.appendChild(video);
        }

        const metaRow = document.createElement('div');
        metaRow.className = 'flex items-start justify-between gap-3';

        const titleEl = document.createElement('div');
        titleEl.className = 'text-white/90 text-sm font-medium leading-snug';
        titleEl.textContent = v.title || '';

        const durationEl = document.createElement('div');
        durationEl.className = 'text-gray-400 text-xs whitespace-nowrap';
        durationEl.textContent = v.duration || '';

        metaRow.appendChild(titleEl);
        metaRow.appendChild(durationEl);

        card.appendChild(frameWrap);
        card.appendChild(metaRow);

        videosContainer.appendChild(card);
      });

      // Если все видео "отфильтровались" (не смогли встроить) — скрываем блок
      setVisible(videoBlock, videosContainer.childElementCount > 0);
    } else {
      setVisible(videoBlock, false);
    }


    // Райдер и документы
    const riderBlock = document.getElementById('artist-rider-block');
    if (riderBlock) {
      const riderTitle = document.getElementById('artist-rider-title');
      const riderDescription = document.getElementById('artist-rider-description');
      if (artist.rider && artist.rider.url) {
        riderBlock.href = artist.rider.url;
        if (artist.rider.download) riderBlock.download = artist.rider.download;
        if (riderTitle) riderTitle.textContent = artist.rider.title || 'Условия работы';
        if (riderDescription) riderDescription.textContent = artist.rider.description || 'Скачать райдер и требования';
        setVisible(riderBlock, true);
      } else {
        setVisible(riderBlock, false);
      }
    }

    // Соцсети
    const social = artist.social || {};
    const socialWrapper = document.getElementById('artist-social-links');
    const instagram = document.getElementById('link-instagram');
    const youtube = document.getElementById('link-youtube');
    const website = document.getElementById('link-website');
    let hasSocial = false;

    if (instagram) {
      if (social.instagram) {
        instagram.href = social.instagram;
        setVisible(instagram, true);
        hasSocial = true;
      } else {
        setVisible(instagram, false);
      }
    }
    if (instagram) {
      if (social.instagram) {
        instagram.href = social.instagram;
        setVisible(instagram, true);
        hasSocial = true;
      } else {
        setVisible(instagram, false);
      }
    }
    if (youtube) {
      if (social.youtube) {
        youtube.href = social.youtube;
        setVisible(youtube, true);
        hasSocial = true;
      } else {
        setVisible(youtube, false);
      }
    }
    if (website) {
      if (social.website) {
        website.href = social.website;
        setVisible(website, true);
        hasSocial = true;
      } else {
        setVisible(website, false);
      }
    }
    setVisible(socialWrapper, hasSocial);

    // Гонорар + телефон (нижняя "плашка" как в индустрии)
    const ctaBar = document.getElementById('artist-cta-bar');
    const feeEl = document.getElementById('artist-fee');
    const feeNoteInlineEl = document.getElementById('artist-fee-note-inline');
    const feeNoteEl = document.getElementById('artist-fee-note');
    const callBtn = document.getElementById('artist-call-btn');
    const phoneLink = document.getElementById('artist-phone-link');

    if (ctaBar && feeEl && feeNoteEl && feeNoteInlineEl && callBtn && phoneLink) {
      const phone = artist.phone ? String(artist.phone).trim() : '';
      const phoneHref = toTelHref(phone);

      const { amountText, noteText } = splitPriceAndNote(artist.price, artist.priceNote);

      feeEl.textContent = amountText;

      // Приписку показываем компактно (рядом) если короткая, иначе — отдельной строкой
      const note = noteText || '';
      const isShort = note.length > 0 && note.length <= 15;

      feeNoteInlineEl.textContent = isShort ? note : '';
      feeNoteEl.textContent = isShort ? '' : note;

      setVisible(feeNoteInlineEl, Boolean(feeNoteInlineEl.textContent));
      setVisible(feeNoteEl, Boolean(feeNoteEl.textContent));

      // Телефон
      callBtn.href = phoneHref;
      phoneLink.href = phoneHref;
      phoneLink.textContent = formatRuPhone(phone);

      const hasPhone = Boolean(phoneHref);
      setVisible(callBtn, hasPhone);
      setVisible(phoneLink, hasPhone);

      setVisible(ctaBar, true);
    } else if (ctaBar) {
      setVisible(ctaBar, false);
    }

    // Устанавливаем правильный URL для кнопки "назад" на основе категории
    const backButton = document.getElementById('back-button');
    if (backButton) {
      const backPageUrl = getBackPageUrl(artist.category);
      backButton.onclick = (e) => {
        e.preventDefault();
        // Если в истории есть страницы, возвращаемся назад
        // Это предотвращает создание бесконечных циклов в истории
        if (window.history.length > 1 && document.referrer.includes(window.location.host)) {
          window.history.back();
        } else {
          // Если истории нет (прямой заход), идем на страницу категории
          window.location.href = backPageUrl;
        }
      };
    }
  } catch (error) {
    console.error('Не удалось загрузить данные профайла', error);
  }
}

// Запускаем наполнение страницы после загрузки DOM
document.addEventListener('DOMContentLoaded', loadArtist);

function getParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

const setVisible = (el, visible) => {
  if (!el) return;
  el.style.display = visible ? '' : 'none';
};

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

async function loadArtist() {
  const id = getParam('id');
  if (!id) return;

  try {
    const response = await fetch('data/participants.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const artists = await response.json();
    const artist = Array.isArray(artists) ? artists.find((item) => item.id === id) : null;
    if (!artist) return;

    // Заголовки
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
    if (hasRating) document.getElementById('artist-rating').textContent = artist.rating;
    if (hasReviews) document.getElementById('artist-reviews').textContent = `(${artist.reviews})`;
    setVisible(ratingBlock, hasRating || hasReviews);

    const cover = document.getElementById('artist-cover');
    if (cover && (artist.coverImage || artist.cardImage)) {
      cover.style.backgroundImage = `url('${artist.coverImage || artist.cardImage}')`;
    }

    // Теги
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

    // Портфолио
    const portfolioBlock = document.getElementById('artist-portfolio-block');
    const portfolio = document.getElementById('artist-portfolio');
    const shots = Array.isArray(artist.portfolio) ? artist.portfolio : [];
    if (portfolioBlock && portfolio && shots.length) {
      setVisible(portfolioBlock, true);
      portfolio.innerHTML = '';
      portfolio.style.display = 'flex';
      shots.forEach((item) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'snap-center shrink-0 w-64 aspect-[3/4] rounded-xl overflow-hidden relative';
        wrapper.innerHTML = `
          <div class="w-full h-full bg-cover bg-center transition-transform hover:scale-105 duration-500"
               data-alt="${item.alt || ''}"
               style="background-image: url('${item.src || ''}')"></div>
        `;
        portfolio.appendChild(wrapper);
      });
    } else {
      setVisible(portfolioBlock, false);
    }

    // Видео
    const videoBlock = document.getElementById('artist-video-block');
    const videoWrapper = document.getElementById('artist-video');
    const hasVideo = artist.video && (artist.video.src || artist.video.title || artist.video.duration);
    if (videoBlock && videoWrapper && hasVideo) {
      if (artist.video.src) {
        videoWrapper.querySelector('.video-bg').style.backgroundImage = `url('${artist.video.src}')`;
      }
      videoWrapper.querySelector('.video-title').textContent = artist.video.title || '';
      videoWrapper.querySelector('.video-duration').textContent = artist.video.duration || '';
      setVisible(videoBlock, true);
    } else {
      setVisible(videoBlock, false);
    }

    // Отзыв
    const test = document.getElementById('artist-testimonial');
    const hasTestimonial = artist.testimonial && (artist.testimonial.text || artist.testimonial.reviewerName);
    if (test && hasTestimonial) {
      const starsEl = test.querySelector('.testimonial-stars');
      starsEl.innerHTML = '';
      const starsCount = artist.testimonial.stars || 0;
      for (let i = 0; i < starsCount; i++) {
        starsEl.innerHTML += '<span class="material-symbols-outlined text-[20px] fill-1">star</span>';
      }
      test.querySelector('.testimonial-date').textContent = artist.testimonial.date || '';
      test.querySelector('.testimonial-text').textContent = artist.testimonial.text || '';
      test.querySelector('.testimonial-reviewer').textContent = artist.testimonial.reviewerName || '';
      const avatar = test.querySelector('.testimonial-avatar');
      if (artist.testimonial.reviewerAvatar) {
        avatar.style.backgroundImage = `url('${artist.testimonial.reviewerAvatar}')`;
      }
      setVisible(test, true);
    } else {
      setVisible(test, false);
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

    // Стоимость
    const priceBar = document.getElementById('artist-cta-bar');
    const priceEl = document.getElementById('artist-price');
    if (priceBar && priceEl && artist.price !== undefined && artist.price !== null && artist.price !== '') {
      priceEl.textContent = `${new Intl.NumberFormat('ru-RU').format(artist.price)} руб.`;
      setVisible(priceBar, true);
    } else {
      setVisible(priceBar, false);
    }
  } catch (error) {
    console.error('Не удалось загрузить данные профайла', error);
  }
}

document.addEventListener('DOMContentLoaded', loadArtist);

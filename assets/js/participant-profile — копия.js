function getParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

async function loadArtist() {
  const id = getParam('id');
  if (!id) return;

  // загружаем данные
  const response = await fetch('data/artists.json');
  const artists = await response.json();
  const artist = artists.find(item => item.id === id);
  if (!artist) return;

  // заполняем основные поля
  document.title = artist.name + ' – Портфолио';
  document.getElementById('artist-name').textContent = artist.name;
  document.getElementById('artist-tagline').textContent = artist.tagline || '';
  document.getElementById('artist-category').textContent = artist.category || '';
  document.getElementById('artist-rating').textContent = artist.rating || '';
  document.getElementById('artist-reviews').textContent = artist.reviews ? '(' + artist.reviews + ')' : '';

  // формируем список тегов
  const tagsContainer = document.getElementById('artist-tags');
  tagsContainer.innerHTML = '';
  (artist.tags || []).forEach(tag => {
    const el = document.createElement('div');
    el.className = 'flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full bg-surface-dark border border-white/5 px-4';
    el.innerHTML = `
      <span class="material-symbols-outlined text-primary text-[18px]">${tag.icon}</span>
      <p class="text-white text-sm font-medium">${tag.text}</p>
    `;
    tagsContainer.appendChild(el);
  });

  // описание
  document.getElementById('artist-about').textContent = artist.about || '';

  // портфолио
  const portfolio = document.getElementById('artist-portfolio');
  portfolio.innerHTML = '';
  (artist.portfolio || []).forEach(item => {
    const wrapper = document.createElement('div');
    wrapper.className = 'snap-center shrink-0 w-64 aspect-[3/4] rounded-xl overflow-hidden relative';
    wrapper.innerHTML = `
      <div class="w-full h-full bg-cover bg-center transition-transform hover:scale-105 duration-500"
           data-alt="${item.alt || ''}"
           style="background-image: url('${item.src}')"></div>
    `;
    portfolio.appendChild(wrapper);
  });

  // видео
  const videoWrapper = document.getElementById('artist-video');
  if (artist.video) {
    videoWrapper.querySelector('.video-bg').style.backgroundImage = `url('${artist.video.src}')`;
    videoWrapper.querySelector('.video-title').textContent = artist.video.title;
    videoWrapper.querySelector('.video-duration').textContent = artist.video.duration;
  } else {
    videoWrapper.style.display = 'none';
  }

  // отзыв
  const test = document.getElementById('artist-testimonial');
  if (artist.testimonial) {
    // звезды
    const starsEl = test.querySelector('.testimonial-stars');
    starsEl.innerHTML = '';
    for (let i = 0; i < (artist.testimonial.stars || 0); i++) {
      starsEl.innerHTML += '<span class="material-symbols-outlined text-[20px] fill-1">star</span>';
    }
    test.querySelector('.testimonial-date').textContent = artist.testimonial.date || '';
    test.querySelector('.testimonial-text').textContent = artist.testimonial.text || '';
    test.querySelector('.testimonial-reviewer').textContent = artist.testimonial.reviewerName || '';
    test.querySelector('.testimonial-avatar').style.backgroundImage =
      `url('${artist.testimonial.reviewerAvatar}')`;
  } else {
    test.style.display = 'none';
  }

  // соцсети
  const social = artist.social || {};
  if (social.instagram) document.getElementById('link-instagram').href = social.instagram;
  if (social.youtube) document.getElementById('link-youtube').href = social.youtube;
  if (social.website) document.getElementById('link-website').href = social.website;

  // цена
  const priceEl = document.getElementById('artist-price');
  priceEl.textContent = artist.price ? new Intl.NumberFormat('ru-RU').format(artist.price) + ' ₽/час' : '';
}

document.addEventListener('DOMContentLoaded', loadArtist);
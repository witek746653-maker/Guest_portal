if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").then((reg) => {
    if (reg.waiting) showUpdateBanner(reg);

    reg.addEventListener("updatefound", () => {
      const nw = reg.installing;
      if (!nw) return;

      nw.addEventListener("statechange", () => {
        if (nw.state === "installed" && navigator.serviceWorker.controller) {
          showUpdateBanner(reg);
        }
      });
    });
  });

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    window.location.reload();
  });
}

function showUpdateBanner(reg) {
  if (document.getElementById("update-banner")) return;

  const banner = document.createElement("div");
  banner.id = "update-banner";
  banner.innerHTML = `
    <div class="update-banner__text">
      Доступно новое обновление. Обновите страницу, чтобы получить свежую версию.
    </div>
    <button class="update-banner__btn" type="button">Обновить</button>
  `;

  const btn = banner.querySelector(".update-banner__btn");
  btn?.addEventListener("click", () => {
    if (reg.waiting) reg.waiting.postMessage({ type: "SKIP_WAITING" });
  });

  document.body.appendChild(banner);
}

// Подгружаем модальное окно "Контакты" лениво — работает как раньше
fetch("./components/contact-modal.html")
  .then((res) => res.text())
  .then((html) => {
    const root = document.getElementById("modal-root");
    if (root) root.innerHTML = html;
  });

document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('gallery-modal');
  const closeBtn = document.getElementById('close-gallery');
  const triggers = document.querySelectorAll('.js-open-gallery');
  if(modal && closeBtn) {
      triggers.forEach(trigger => {
          trigger.addEventListener('click', (e) => {
              e.preventDefault();
              modal.classList.remove('hidden');
              document.body.style.overflow = 'hidden';
          });
      });
      closeBtn.addEventListener('click', () => {
          modal.classList.add('hidden');
          document.body.style.overflow = '';
      });
      modal.addEventListener('click', (e) => {
          if (e.target === modal) {
              modal.classList.add('hidden');
              document.body.style.overflow = '';
          }
      });
  }
});
// Расчёт расстояния до ресторана и отображение "X км от вас"
(function () {
  const distanceEl = document.getElementById('distance-text');
  if (!distanceEl) return; // мы не на странице контактов

  // Координаты ресторана (можете уточнить по Яндекс/Google Maps)
  const RESTAURANT_LAT = 55.7640;
  const RESTAURANT_LNG = 37.5638;

  function toRad(deg) {
    return (deg * Math.PI) / 180;
  }

  function getDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // радиус Земли, км
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  if (!('geolocation' in navigator)) {
    // если геолокация недоступна — просто не трогаем текст
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      const distanceKm = getDistanceKm(
        latitude,
        longitude,
        RESTAURANT_LAT,
        RESTAURANT_LNG
      );

      const value =
        distanceKm < 1
          ? `${Math.round(distanceKm * 1000)} м от вас • Построить маршрут`
          : `${distanceKm.toFixed(1)} км от вас • Построить маршрут`;

      distanceEl.textContent = value;
    },
    () => {
      // при ошибке геолокации оставляем дефолтный текст
      // либо можно установить, например:
      // distanceEl.textContent = 'Рядом с вами • Построить маршрут';
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
    }
  );
})();
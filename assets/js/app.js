// Флаг для предотвращения множественных обновлений
let isUpdating = false;

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").then((reg) => {
    // Проверяем, есть ли ожидающий Service Worker
    if (reg.waiting) {
      handleServiceWorkerUpdate(reg);
    }

    // Слушаем события обновления
    reg.addEventListener("updatefound", () => {
      const nw = reg.installing;
      if (!nw) return;

      nw.addEventListener("statechange", () => {
        // Когда новый Service Worker установлен и есть активный контроллер
        if (nw.state === "installed" && navigator.serviceWorker.controller) {
          handleServiceWorkerUpdate(reg);
        }
      });
    });

    // Периодически проверяем обновления (каждые 60 секунд)
    setInterval(() => {
      reg.update();
    }, 60000);
  });

  // Когда Service Worker активирован, показываем уведомление и перезагружаем страницу
  let controllerChangeHandled = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    // Предотвращаем множественные обработки
    if (controllerChangeHandled) return;
    controllerChangeHandled = true;

    // Показываем уведомление об обновлении
    showUpdateNotification();

    // Перезагружаем страницу через небольшую задержку, чтобы пользователь увидел уведомление
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  });
}

// Обработка обновления Service Worker
function handleServiceWorkerUpdate(reg) {
  if (isUpdating) return; // Предотвращаем множественные обновления
  isUpdating = true;

  // Активируем новый Service Worker сразу
  if (reg.waiting) {
    reg.waiting.postMessage({ type: "SKIP_WAITING" });
  }
  // Уведомление покажем при controllerchange
}

// Показываем простое уведомление об обновлении (toast)
function showUpdateNotification() {
  // Удаляем старое уведомление, если оно есть
  const existingToast = document.getElementById("update-toast");
  if (existingToast) {
    existingToast.remove();
  }

  // Создаем новое уведомление
  const toast = document.createElement("div");
  toast.id = "update-toast";
  toast.innerHTML = `
    <div class="update-toast__content">
      <span class="material-symbols-outlined">check_circle</span>
      <span>Приложение обновлено</span>
    </div>
  `;

  document.body.appendChild(toast);

  // Показываем уведомление
  setTimeout(() => {
    toast.classList.add("show");
  }, 100);

  // Автоматически скрываем через 3 секунды
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 300);
  }, 3000);
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
  if (modal && closeBtn) {
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

document.getElementById('shareBtn').addEventListener('click', async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Заголовок',
        text: 'Описание или сообщение',
        url: window.location.href
      });
    } catch (e) {
      // пользователь закрыл меню — это нормально
    }
  } else {
    alert('Шаринг не поддерживается в этом браузере');
  }
});
// Глобальный обработчик кнопки "Назад"
const globalBackButton = document.getElementById('back-button');
if (globalBackButton) {
  globalBackButton.addEventListener('click', (e) => {
    // Если на странице уже есть свой обработчик (как в профилях), 
    // этот код может быть перекрыт или дополнен.
    // Но для простых страниц (Услуги, Контакты) он сработает как база.
    if (window.history.length > 1 && document.referrer.includes(window.location.host)) {
      e.preventDefault();
      window.history.back();
    }
    // Если истории нет, кнопка сработает как обычная ссылка (если это <a>) 
    // или ничего не сделает (если это <button>), позволяя странице самой решить.
  });
}

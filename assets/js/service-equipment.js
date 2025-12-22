/**
 * Скрипт для страницы service-equipment.html
 * Отображает технику и оборудование из participants.json
 * Категория: Техника и оборудование
 */

let currentCategories = [];
let currentSearchQuery = '';
let currentTagFilter = '';

async function renderGrid() {
  if (!window.ParticipantsService) {
    console.error('ParticipantsService не загружен. Убедитесь, что participants.service.js подключен перед этим скриптом.');
    return;
  }

  await window.ParticipantsService.renderParticipantsGrid(
    'artists-grid',
    currentCategories,
    'participant-profile.html',
    currentSearchQuery,
    currentTagFilter
  );
}

function updateFilterChips() {
  const chips = document.querySelectorAll('.filter-chip');
  chips.forEach((chip) => {
    const tag = chip.getAttribute('data-tag') || '';
    const isActive = tag === currentTagFilter;
    
    if (isActive) {
      chip.classList.remove('bg-surface-dark', 'border', 'border-white/5');
      chip.classList.add('bg-primary');
      const text = chip.querySelector('p');
      if (text) {
        text.classList.remove('text-white/90', 'font-medium');
        text.classList.add('text-[#221910]', 'font-bold');
      }
    } else {
      chip.classList.remove('bg-primary');
      chip.classList.add('bg-surface-dark', 'border', 'border-white/5');
      const text = chip.querySelector('p');
      if (text) {
        text.classList.remove('text-[#221910]', 'font-bold');
        text.classList.add('text-white/90', 'font-medium');
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  if (!window.ParticipantsService) {
    console.error('ParticipantsService не загружен. Убедитесь, что participants.service.js подключен перед этим скриптом.');
    return;
  }

  currentCategories = ['Техника и оборудование'];

  // Настройка поиска
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        currentSearchQuery = e.target.value;
        renderGrid();
      }, 300);
    });
  }

  // Настройка фильтров по тегам
  const filterChips = document.querySelectorAll('.filter-chip');
  filterChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const tag = chip.getAttribute('data-tag') || '';
      currentTagFilter = tag;
      updateFilterChips();
      renderGrid();
    });
  });

  await renderGrid();
  updateFilterChips();
});

/**
 * Скрипт для страницы service-artists.html
 * Отображает артистов и ведущих из participants.json
 * Категории: Кавер группа, Сольный артист, Саксофон, Скрипка, Ведущий
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Проверяем наличие сервиса
  if (!window.ParticipantsService) {
    console.error('ParticipantsService не загружен. Убедитесь, что participants.service.js подключен перед этим скриптом.');
    return;
  }

  // Категории для страницы артистов и ведущих
  const categories = [
    'Кавер группа',
    'Сольный артист',
    'Саксофон',
    'Скрипка',
    'Ведущий'
  ];

  // Рендерим сетку участников
  await window.ParticipantsService.renderParticipantsGrid(
    'artists-grid',
    categories,
    'participant-profile.html'
  );
});

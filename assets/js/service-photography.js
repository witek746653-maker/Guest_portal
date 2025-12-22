/**
 * Скрипт для страницы service-photography.html
 * Отображает фотографов из participants.json
 * Категория: Фотограф
 */

document.addEventListener('DOMContentLoaded', async () => {
  if (!window.ParticipantsService) {
    console.error('ParticipantsService не загружен. Убедитесь, что participants.service.js подключен перед этим скриптом.');
    return;
  }

  const categories = ['Фотограф'];

  await window.ParticipantsService.renderParticipantsGrid(
    'artists-grid',
    categories,
    'participant-profile.html'
  );
});


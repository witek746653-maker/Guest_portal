/**
 * Скрипт для страницы service-sound-engeneer.html
 * Отображает звукорежиссеров из participants.json
 * Категория: Звукорежиссер
 */

document.addEventListener('DOMContentLoaded', async () => {
  if (!window.ParticipantsService) {
    console.error('ParticipantsService не загружен. Убедитесь, что participants.service.js подключен перед этим скриптом.');
    return;
  }

  const categories = ['Звукорежиссер'];

  await window.ParticipantsService.renderParticipantsGrid(
    'artists-grid',
    categories,
    'participant-profile.html'
  );
});


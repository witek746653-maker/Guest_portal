/**
 * Скрипт для страницы service-equipment.html
 * Отображает технику и оборудование из participants.json
 * Категория: Техника и оборудование
 */

document.addEventListener('DOMContentLoaded', async () => {
  if (!window.ParticipantsService) {
    console.error('ParticipantsService не загружен. Убедитесь, что participants.service.js подключен перед этим скриптом.');
    return;
  }

  const categories = ['Техника и оборудование'];

  await window.ParticipantsService.renderParticipantsGrid(
    'artists-grid',
    categories,
    'participant-profile.html'
  );
});


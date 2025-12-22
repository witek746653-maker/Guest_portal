/**
 * Скрипт для страницы service-decoration.html
 * Отображает флористов и оформителей из participants.json
 * Категория: Флорист и оформитель
 */

document.addEventListener('DOMContentLoaded', async () => {
  if (!window.ParticipantsService) {
    console.error('ParticipantsService не загружен. Убедитесь, что participants.service.js подключен перед этим скриптом.');
    return;
  }

  const categories = ['Флорист и оформитель'];

  await window.ParticipantsService.renderParticipantsGrid(
    'artists-grid',
    categories,
    'participant-profile.html'
  );
});


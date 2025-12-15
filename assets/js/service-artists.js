async function loadParticipants() {
  const grid = document.getElementById('artists-grid');
  if (!grid) return;

  try {
    const response = await fetch('data/participants.json');
    const participants = await response.json();

    grid.innerHTML = '';
    participants
      .filter((person) => person && person.id)
      .forEach((person) => {
      const card = document.createElement('a');
      card.href = `participant-profile.html?id=${person.id}`;
      card.className = 'group relative flex flex-col gap-3 rounded-xl overflow-hidden aspect-[3/4] cursor-pointer';

      const image = document.createElement('div');
      image.className = 'absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110';
      image.style.backgroundImage = `url('${person.cardImage || person.coverImage || ''}')`;

      const overlay = document.createElement('div');
      overlay.className = 'absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent';

      const content = document.createElement('div');
      content.className = 'relative z-10 flex flex-col h-full justify-end p-3';

      const category = document.createElement('p');
      category.className = 'text-primary text-xs font-bold uppercase tracking-wider mb-1';
      category.textContent = person.category || '';

      const name = document.createElement('p');
      name.className = 'text-white text-base font-bold leading-tight';
      name.textContent = person.name || 'Участник';

      content.appendChild(category);
      content.appendChild(name);

      card.appendChild(image);
      card.appendChild(overlay);
      card.appendChild(content);
      grid.appendChild(card);
    });
  } catch (e) {
    console.error('Не удалось загрузить список участников', e);
  }
}

document.addEventListener('DOMContentLoaded', loadParticipants);

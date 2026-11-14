(() => {
  'use strict';

  const dishes = Array.isArray(window.CHEF_MENU) ? window.CHEF_MENU : [];
  const category = document.getElementById('category');
  const query = document.getElementById('query');
  const sections = document.getElementById('piatti');
  const status = document.getElementById('risultati');
  const reset = document.getElementById('reset');
  const currency = new Intl.NumberFormat('it-IT', {style: 'currency', currency: 'EUR'});

  if (!dishes.length) {
    status.textContent = 'Il menu non è disponibile al momento.';
    return;
  }

  function forSearch(text) {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('it-IT').trim();
  }

  function create(tag, className, value) {
    const node = document.createElement(tag);
    node.className = className;
    node.textContent = value;
    return node;
  }

  const categories = new Map();
  for (const dish of dishes) {
    if (!categories.has(dish.category)) categories.set(dish.category, []);
    categories.get(dish.category).push(dish);
  }
  for (const label of categories.keys()) category.add(new Option(label, label));
  document.querySelector('.filters').hidden = false;

  function dishRow(dish) {
    const row = document.createElement('li');
    if (dish.image) {
      const photo = document.createElement('button');
      photo.type = 'button';
      photo.className = 'dish-photo';
      photo.dataset.zoomImage = dish.image;
      photo.dataset.photoName = dish.name;
      photo.setAttribute('aria-label', 'Ingrandisci la foto di ' + dish.name);
      const img = document.createElement('img');
      img.alt = '';
      img.loading = 'lazy';
      img.decoding = 'async';
      img.addEventListener('error', () => {
        row.classList.remove('dish-with-photo');
        photo.remove();
      }, {once: true});
      img.src = dish.thumbnail || dish.image;
      photo.append(img);
      row.className = 'dish-with-photo';
      row.append(photo);
    }
    const copy = document.createElement('div');
    copy.append(create('h3', 'dish-name', dish.name));
    if (dish.description) copy.append(create('p', 'ingredients', dish.description));
    row.append(copy);
    if (Number.isFinite(dish.price)) {
      const actions = document.createElement('div');
      actions.className = 'dish-actions';
      const add = create('button', 'dish-add', 'Aggiungi');
      add.type = 'button';
      add.dataset.add = dish.id;
      add.setAttribute('aria-label', 'Aggiungi ' + dish.name + ' al carrello');
      actions.append(create('span', 'amount', currency.format(dish.price)), add);
      row.append(actions);
    }
    return row;
  }

  function updateMenu() {
    const term = forSearch(query.value);
    const content = document.createDocumentFragment();
    let count = 0;
    let groupIndex = 0;
    for (const [label, group] of categories) {
      if (category.value && category.value !== label) continue;
      const matches = group.filter(dish => forSearch([dish.name, dish.description].filter(Boolean).join(' ')).includes(term));
      if (!matches.length) continue;
      const section = document.createElement('section');
      section.className = 'menu-group';
      const heading = create('h2', 'group-title', label);
      heading.id = 'categoria-' + (++groupIndex);
      section.setAttribute('aria-labelledby', heading.id);
      const list = document.createElement('ul');
      list.className = 'dish-list';
      for (const dish of matches) list.append(dishRow(dish));
      section.append(heading);
      const note = window.CHEF_MENU_NOTES?.[label];
      if (note) section.append(create('p', 'group-note', note));
      section.append(list);
      content.append(section);
      count += matches.length;
    }
    sections.replaceChildren(content);
    const filtered = Boolean(term || category.value);
    reset.hidden = count > 0 || !filtered;
    status.textContent = count === 0 ? 'Nessuna voce corrisponde alla ricerca.'
      : count === 1 ? '1 voce' : count + ' voci' + (filtered ? ' trovate' : ' nel menu');
  }

  query.addEventListener('input', updateMenu);
  category.addEventListener('change', updateMenu);
  reset.addEventListener('click', () => {
    query.value = '';
    category.value = '';
    updateMenu();
    query.focus();
  });
  updateMenu();
})();

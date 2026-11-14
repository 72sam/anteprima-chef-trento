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

  const pricedDishes = dishes.filter(dish => Number.isFinite(dish.price));
  const deliveryPrices = pricedDishes.filter(dish => dish.priceSource === 'Deliveroo');
  const defaultPriceSource = deliveryPrices.length > pricedDishes.length / 2 ? 'Deliveroo' : null;
  if (defaultPriceSource) {
    document.getElementById('price-note').textContent =
      'I prezzi di anteprima sono quelli di Deliveroo, salvo dove indicato. Per il listino in sala e la disponibilità dei piatti, chiedi a Chef.';
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
    const copy = document.createElement('div');
    copy.append(create('h3', 'dish-name', dish.name));
    if (dish.description) copy.append(create('p', 'ingredients', dish.description));
    row.append(copy);
    if (Number.isFinite(dish.price)) {
      const amount = create('div', 'amount', currency.format(dish.price));
      if (dish.priceSource && dish.priceSource !== defaultPriceSource) {
        amount.append(create('small', 'source', dish.priceSource));
      }
      row.append(amount);
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
      section.append(heading, list);
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

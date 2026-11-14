(() => {
  'use strict';

  // Every interaction is local to this demonstration page.
  const products = [
    { id: 'bufala', name: 'Pizza Bufala', price: 13, category: 'pizze', special: true, description: 'Pomodoro, mozzarella di bufala e basilico. Ricetta e prezzo da confermare.', tagline: 'Fotografia del locale · prezzo di prova', image: 'assets/pizza-hero.jpg' },
    { id: 'crudo', name: 'Crudo e Bufala', price: 15, category: 'pizze', special: true, description: 'Una delle proposte fotografate di Chef. Ingredienti e allergeni da validare con la gestione.', tagline: 'Fotografia del locale · prezzo di prova', image: 'assets/pizza-detail.jpg' },
    { id: 'zuccotto', name: 'Zuccotto al pistacchio', price: 6, category: 'dolci', special: false, description: 'Un finale dolce, dalla selezione fotografica del locale. Listino da confermare.', tagline: 'Fotografia del locale · prezzo di prova', image: 'assets/tiramisu.jpg' },
    { id: 'acqua', name: 'Acqua', price: 2, category: 'bevande', special: false, description: 'Voce di esempio per provare il carrello.', tagline: 'Voce e prezzo dimostrativi', emoji: 'H₂O' }
  ];

  const byId = (id) => document.getElementById(id);
  const euro = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' });
  const basket = new Map();
  let category = 'all';
  let toastTimer;

  function element(tag, className, value) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value !== undefined) node.textContent = value;
    return node;
  }

  function notify(message) {
    const toast = byId('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.hidden = false;
    toast.classList.add('visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.classList.remove('visible');
      toast.hidden = true;
    }, 3200);
  }

  function visibleProducts() {
    if (category === 'all') return products;
    if (category === 'speciali') return products.filter((item) => item.special);
    return products.filter((item) => item.category === category);
  }

  function renderMenu() {
    const grid = byId('menu-grid');
    if (!grid) return;
    const cards = visibleProducts().map((item) => {
      const card = element('article', 'menu-card');
      if (item.image) {
        const img = document.createElement('img');
        img.src = item.image;
        img.alt = item.name + ' - fotografia di Pizzeria Chef';
        img.loading = 'lazy';
        card.append(img);
      } else {
        const visual = element('div', 'card-visual', item.emoji || '');
        visual.setAttribute('aria-hidden', 'true');
        card.append(visual);
      }
      const body = element('div', 'card-body');
      const top = element('div', 'card-top');
      top.append(element('h3', '', item.name), element('span', 'price', euro.format(item.price)));
      body.append(top, element('p', 'description', item.description), element('p', 'tagline', item.tagline));
      const add = element('button', 'add-button', 'Aggiungi');
      add.type = 'button';
      add.dataset.add = item.id;
      add.setAttribute('aria-label', `Aggiungi ${item.name} al carrello`);
      body.append(add);
      card.append(body);
      return card;
    });
    grid.replaceChildren(...cards);
    document.querySelectorAll('#category-tabs [data-category]').forEach((button) => {
      const active = button.dataset.category === category;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  function count() {
    return [...basket.values()].reduce((sum, quantity) => sum + quantity, 0);
  }

  function total() {
    return products.reduce((sum, item) => sum + item.price * (basket.get(item.id) || 0), 0);
  }

  function renderCart() {
    const quantity = count();
    const formattedTotal = euro.format(total());
    for (const id of ['cart-count', 'cart-count-mobile']) {
      const node = byId(id);
      if (node) node.textContent = String(quantity);
    }
    for (const id of ['cart-total', 'cart-total-mobile']) {
      const node = byId(id);
      if (node) node.textContent = formattedTotal;
    }

    const empty = byId('cart-empty');
    const content = byId('cart-content');
    if (empty) empty.hidden = quantity > 0;
    if (content) content.hidden = quantity === 0;
    const form = byId('checkout-form');
    if (form) {
      const submit = form.querySelector('[type="submit"]');
      if (submit) submit.disabled = quantity === 0;
    }

    const rows = [];
    for (const item of products) {
      const itemQuantity = basket.get(item.id) || 0;
      if (!itemQuantity) continue;
      const row = element('div', 'cart-row');
      const info = element('div', 'cart-item-info');
      info.append(element('strong', '', item.name), element('span', '', `${euro.format(item.price)} × ${itemQuantity}`));
      const controls = element('div', 'qty-control');
      for (const [delta, label] of [[-1, '−'], [1, '+']]) {
        const button = element('button', '', label);
        button.type = 'button';
        button.dataset.quantity = item.id;
        button.dataset.delta = String(delta);
        button.setAttribute('aria-label', `${delta < 0 ? 'Diminuisci' : 'Aumenta'} quantità di ${item.name}`);
        button.disabled = delta > 0 && itemQuantity >= 20;
        controls.append(button);
      }
      row.append(info, controls);
      rows.push(row);
    }
    const list = byId('cart-items');
    if (list) list.replaceChildren(...rows);
  }

  function changeQuantity(id, delta) {
    const item = products.find((entry) => entry.id === id);
    if (!item) return;
    const next = Math.max(0, Math.min(20, (basket.get(id) || 0) + delta));
    if (next === 0) basket.delete(id);
    else basket.set(id, next);
    const receipt = byId('cart-receipt');
    if (receipt) {
      receipt.replaceChildren();
      receipt.hidden = true;
    }
    renderCart();
    if (delta > 0) notify(`${item.name} aggiunta al carrello dimostrativo`);
  }

  function openDialog(id) {
    const dialog = byId(id);
    if (dialog && !dialog.open) dialog.showModal();
  }

  function localToday() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function resetDemo() {
    basket.clear();
    try { sessionStorage.removeItem('chef-booking-demo'); sessionStorage.removeItem('chef-order-demo'); sessionStorage.removeItem('chef-dashboard-demo'); } catch {}
    renderCart();
    const checkout = byId('checkout-form');
    if (checkout) checkout.reset();
    const booking = byId('booking-form');
    if (booking) booking.reset();
    const receipt = byId('cart-receipt');
    if (receipt) {
      receipt.replaceChildren();
      receipt.hidden = true;
    }
    const result = byId('booking-result');
    if (result) {
      result.replaceChildren();
      result.hidden = true;
    }
    const date = byId('booking-date');
    if (date) { date.min = localToday(); date.value = localToday(); }
    notify('Demo azzerata');
  }

  document.addEventListener('DOMContentLoaded', () => {
    const date = byId('booking-date');
    if (date) { date.min = localToday(); date.value=localToday(); }
    renderMenu();
    renderCart();

    document.addEventListener('click', (event) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;

      const tab = target.closest('#category-tabs [data-category]');
      if (tab && ['all', 'pizze', 'speciali', 'dolci', 'bevande'].includes(tab.dataset.category)) {
        category = tab.dataset.category;
        renderMenu();
        return;
      }
      const add = target.closest('[data-add]');
      if (add) return changeQuantity(add.dataset.add, 1);
      const qty = target.closest('[data-quantity]');
      if (qty) return changeQuantity(qty.dataset.quantity, Number(qty.dataset.delta) || 0);
      if (target.closest('#cart-open, [data-open-cart]')) return openDialog('cart-dialog');
      if (target.closest('[data-open-booking]')) return openDialog('booking-dialog');
      const close = target.closest('[data-close-dialog]');
      if (close) {
        const dialog = close.closest('dialog');
        if (dialog) dialog.close();
        return;
      }
      if (target.closest('#reset-demo')) return resetDemo();
      const toggle = target.closest('#mobile-menu-toggle');
      if (toggle) {
        const nav = byId('mobile-nav');
        if (nav) {
          nav.classList.toggle('hidden');
          toggle.setAttribute('aria-expanded', String(!nav.classList.contains('hidden')));
        }
        return;
      }
      if (target.closest('#mobile-nav a')) {
        const nav = byId('mobile-nav');
        const button = byId('mobile-menu-toggle');
        if (nav) nav.classList.add('hidden');
        if (button) button.setAttribute('aria-expanded', 'false');
      }
    });

    const checkout = byId('checkout-form');
    if (checkout) checkout.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!checkout.reportValidity() || count() === 0) return;
      const receipt = byId('cart-receipt');
      if (!receipt) return;
      const time = byId('pickup-time');
      const summary = `${count()} prodotti · ${euro.format(total())}${time && time.value ? ` · Ritiro: ${time.value}` : ''}`;
      receipt.replaceChildren(
        element('strong', '', 'Ecco il tuo ordine di prova.'),
        element('p', '', summary),
        element('p', '', 'Simulazione completata, non è un ordine reale.')
      );
      try { sessionStorage.setItem('chef-order-demo', JSON.stringify({time:time.value,items:count(),total:total()})); } catch {}
      const dashboardLink=element('a','button button-dark','Vedi l’ordine nella dashboard SL ↗');dashboardLink.href='sala.html#ordini';receipt.append(dashboardLink);
      receipt.hidden = false;
      receipt.scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      notify('Ordine dimostrativo creato');
    });

    const booking = byId('booking-form');
    if (booking) booking.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!booking.reportValidity()) return;
      const dateInput = byId('booking-date');
      if (dateInput && dateInput.value < localToday()) {
        dateInput.setCustomValidity('Seleziona una data da oggi in poi.');
        dateInput.reportValidity();
        dateInput.setCustomValidity('');
        return;
      }
      const result = byId('booking-result');
      if (!result) return;
      const name = 'Cliente demo';
      const day = dateInput?.value || '';
      const time = byId('booking-time')?.value || '';
      const guests = byId('booking-guests')?.value || '';
      result.replaceChildren(
        element('strong', '', 'Ecco la tua prenotazione di prova.'),
        element('p', '', `${name} · ${day} · ${time} · ${guests} ${guests === '1' ? 'persona' : 'persone'}`),
        element('p', '', 'Simulazione completata, non è una prenotazione reale.')
      );
      try { sessionStorage.setItem('chef-booking-demo', JSON.stringify({day,time,guests:Number(guests)})); } catch {}
      const a=document.createElement('a');a.className='button button-dark';a.href='sala.html';a.textContent='Apri la prenotazione nella dashboard SL ↗';result.append(a);
      result.append(element('p','','Prova anche l’arrivo del cliente e l’assegnazione del tavolo nella dashboard dimostrativa.'));
      result.hidden = false;
      result.scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      notify('Prenotazione dimostrativa creata');
    });
  });
})();

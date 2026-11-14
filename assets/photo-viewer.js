(() => {
  'use strict';

  let viewer;
  let title;
  let image;
  let error;
  let opener;

  function createViewer() {
    viewer = document.createElement('dialog');
    viewer.className = 'dish-lightbox';
    viewer.setAttribute('aria-labelledby', 'photo-viewer-title');

    const header = document.createElement('div');
    header.className = 'dish-lightbox-header';
    title = document.createElement('h2');
    title.id = 'photo-viewer-title';
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'dish-lightbox-close';
    close.textContent = 'Chiudi';
    close.autofocus = true;
    close.addEventListener('click', () => viewer.close());
    header.append(title, close);

    image = document.createElement('img');
    image.className = 'dish-lightbox-image';
    image.alt = '';
    error = document.createElement('p');
    error.className = 'dish-lightbox-error';
    error.setAttribute('role', 'status');
    error.textContent = 'La foto non è disponibile al momento.';
    image.addEventListener('error', () => {
      if (viewer.open && image.hasAttribute('src')) {
        image.hidden = true;
        error.hidden = false;
      }
    });
    viewer.append(header, image, error);
    document.body.append(viewer);

    viewer.addEventListener('click', event => {
      if (event.target !== viewer) return;
      const bounds = viewer.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right ||
          event.clientY < bounds.top || event.clientY > bounds.bottom) viewer.close();
    });
    viewer.addEventListener('close', () => {
      image.removeAttribute('src');
      if (opener?.isConnected) opener.focus({preventScroll: true});
      opener = null;
    });
  }

  document.addEventListener('click', event => {
    const button = event.target.closest('button[data-zoom-image]');
    if (!button) return;
    if (!viewer) createViewer();
    opener = button;
    title.textContent = button.dataset.photoName || 'Foto del piatto';
    image.hidden = false;
    error.hidden = true;
    viewer.showModal();
    image.src = button.dataset.zoomImage;
  });
})();

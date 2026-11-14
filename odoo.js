(() => {
  'use strict';
  const frame = document.querySelector('.video-frame');
  const trigger = document.querySelector('.video-start');
  const restart = document.getElementById('restart-video');
  function play() {
    const iframe = document.createElement('iframe');
    iframe.src = 'https://www.youtube-nocookie.com/embed/t_MCzbETS4k?start=449&end=509&autoplay=1&rel=0&playsinline=1';
    iframe.title = 'Odoo ufficiale: gestione prenotazioni, estratto di 60 secondi';
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.replaceChildren(iframe);
    restart.hidden = false;
  }
  trigger.addEventListener('click', play);
  restart.addEventListener('click', play);
})();

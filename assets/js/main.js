/* ============================================================================
   CBS | Cristina Beltrán Serrano — main.js

   Sin librerías. Se ocupa de:
     1. Cabecera sólida al bajar + barra de progreso de lectura.
     2. Menú de móvil.
     3. Aparición de titulares, tarjetas y fotos al entrar en pantalla.
     4. Resplandor que sigue al cursor dentro de las tarjetas.
     5. Botón flotante de WhatsApp.
     6. Formulario: compone el mensaje y lo abre en WhatsApp.
     7. Año del pie.

   La web funciona sin este archivo: el <noscript> del <head> deja visible
   todo lo que aquí se anima, y junto al formulario hay enlaces directos.
   ========================================================================== */

(function () {
  'use strict';

  var WHATSAPP = '34665143681';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* -- 1. Cabecera y barra de progreso -------------------------------------- */

  var header = $('.site-header');
  var progress = $('[data-progress]');
  var floating = $('.floating-wa');
  var ticking = false;

  function onScroll() {
    var y = window.scrollY;

    if (header) header.classList.toggle('is-scrolled', y > 80);

    if (progress) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
    }

    if (floating) floating.classList.toggle('is-visible', y > window.innerHeight * 0.75);


    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
  }, { passive: true });

  onScroll();

  /* -- 2. Menú de móvil ------------------------------------------------------ */

  var toggle = $('.nav-toggle');

  if (toggle) {
    var setMenu = function (open) {
      document.body.classList.toggle('is-menu-open', open);
      document.documentElement.style.overflow = open ? 'hidden' : '';
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      $('.nav-toggle-text', toggle).textContent = open ? 'Cerrar' : 'Menú';
    };

    toggle.addEventListener('click', function () {
      setMenu(!document.body.classList.contains('is-menu-open'));
    });

    // Al elegir una sección el menú se cierra solo.
    $$('.nav-panel a').forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('is-menu-open')) {
        setMenu(false);
        toggle.focus();
      }
    });

    // Si se pasa a escritorio con el menú abierto, se descarta el estado.
    window.matchMedia('(min-width: 701px)').addEventListener('change', function (e) {
      if (e.matches) setMenu(false);
    });
  }

  /* -- 3. Aparición al hacer scroll ------------------------------------------ */

  $$('.main > section, main > section, .service-card, .package-card, .project-card, .process-step, .contact-card, .form-block')
    .forEach(function (el) { el.setAttribute('data-reveal', ''); });
  var items = $$('[data-reveal], [data-rule]');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var STAGGER = 70;
    var MAX_STEPS = 5;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        var el = entry.target;
        var siblings = el.parentElement
          ? el.parentElement.querySelectorAll(':scope > [data-reveal]')
          : [el];
        var step = Math.min(Math.max(Array.prototype.indexOf.call(siblings, el), 0), MAX_STEPS);

        el.style.transitionDelay = (step * STAGGER) + 'ms';
        el.classList.add('is-visible');
        observer.unobserve(el);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });

    items.forEach(function (el) { observer.observe(el); });

    // Red de seguridad: si algo no llegara a dispararse, se muestra igualmente.
    window.setTimeout(function () {
      items.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight) el.classList.add('is-visible');
      });
    }, 2500);
  }

  /* -- 4. Resplandor que sigue al cursor ------------------------------------- */

  if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
    $$('[data-glow]').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
        card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
      });
    });
  }

  /* -- 5. Formulario: compone el mensaje y lo abre en WhatsApp ---------------- */

  var form = $('[data-form]');

  if (form) {
    var note = $('[data-form-note]');
    var lang = (document.documentElement.lang || 'es').slice(0, 2);

    var T = lang === 'en'
      ? { saludo: 'Hi Cristina, I am',    de: 'from',  abriendo: 'Opening WhatsApp…',
          fallo: 'If WhatsApp did not open, write to +34 665 143 681.' }
      : { saludo: 'Hola Cristina, soy',   de: 'de',    abriendo: 'Abriendo WhatsApp…',
          fallo: 'Si no se ha abierto WhatsApp, escríbeme al +34 665 143 681.' };

    form.addEventListener('submit', function (e) {
      if (!form.checkValidity()) return;   // el navegador enseña sus propios avisos
      e.preventDefault();

      var v = function (n) { return (form.elements[n].value || '').trim(); };
      var mensaje = T.saludo + ' ' + v('nombre') + ', ' + T.de + ' ' + v('negocio') + '.\n\n' + v('necesita');
      var url = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(mensaje);

      if (note) note.textContent = T.abriendo;

      var w = window.open(url, '_blank', 'noopener');
      if (!w) window.location.href = url;   // si el navegador bloquea la ventana

      window.setTimeout(function () { if (note) note.textContent = T.fallo; }, 2500);
    });
  }

  /* -- 6. Año del pie -------------------------------------------------------- */

  var year = $('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
})();

/* Henko · JS mínimo y sin dependencias: menú móvil, pie plegable, revelado al scroll, cifras animadas y formulario.
   Sin JS (o con movimiento reducido) todo el contenido queda visible. */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Menú móvil: botón con nombre accesible y estado; se cierra con Escape y al elegir un enlace */
  var btn = document.querySelector('.nav-toggle');
  var nav = document.getElementById('menu');
  if (btn && nav) {
    var setMenu = function (open) {
      nav.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    };
    btn.addEventListener('click', function () { setMenu(!nav.classList.contains('is-open')); });
    nav.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); btn.focus(); }
    });
  }

  /* Pie: en móvil la navegación y los servicios van plegados; en escritorio siempre abiertos */
  var folds = Array.prototype.slice.call(document.querySelectorAll('.fold'));
  if (folds.length && window.matchMedia) {
    var mq = window.matchMedia('(min-width: 56.25em)');
    var syncFolds = function () {
      folds.forEach(function (d) {
        var s = d.querySelector('summary');
        if (mq.matches) { d.open = true; if (s) s.setAttribute('tabindex', '-1'); }
        else { d.open = false; if (s) s.removeAttribute('tabindex'); }
      });
    };
    syncFolds();
    if (mq.addEventListener) mq.addEventListener('change', syncFolds);
  }

  /* Revelado al hacer scroll (módulos completos, 0,3 s) */
  var items = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  var canObserve = 'IntersectionObserver' in window && !reduce;
  if (!canObserve) {
    items.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* Cifras animadas (el valor final está en el HTML y el ancho es estable) */
  var counters = Array.prototype.slice.call(document.querySelectorAll('[data-count]'));
  if (canObserve && counters.length) {
    var run = function (el) {
      var target = parseInt(el.getAttribute('data-count'), 10);
      var prefix = el.getAttribute('data-prefix') || '';
      var t0 = null;
      var dur = 1100;
      var step = function (t) {
        if (t0 === null) t0 = t;
        var p = Math.min((t - t0) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = prefix + Math.round(target * eased);
        if (p < 1) window.requestAnimationFrame(step);
      };
      window.requestAnimationFrame(step);
    };
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { run(e.target); co.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { el.textContent = (el.getAttribute('data-prefix') || '') + '0'; co.observe(el); });
  }

  /* Formulario: preselección por ?servicio=<slug> y estados de envío.
     Mientras no haya data-endpoint, funciona en modo de prueba y no envía nada. */
  var form = document.querySelector('form.form');
  if (form) {
    var sel = form.querySelector('select[name="servicio"]');
    var slug = new URLSearchParams(window.location.search).get('servicio');
    if (sel && slug) {
      for (var i = 0; i < sel.options.length; i++) { if (sel.options[i].value === slug) { sel.selectedIndex = i; break; } }
    }
    var status = form.querySelector('.form__status');
    var show = function (msg) { if (status) { status.textContent = msg; status.hidden = false; } };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (status) status.hidden = true;
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var endpoint = form.getAttribute('data-endpoint');
      if (!endpoint) { show('Modo de prueba: el formulario todavía no está conectado, no se envió nada.'); return; }
      fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (r) {
          if (!r.ok) throw new Error('http ' + r.status);
          form.reset();
          show('Gracias. Recibimos tu consulta y te vamos a responder pronto.');
        })
        .catch(function () { show('No pudimos enviar tu consulta. Probá de nuevo o escribinos por WhatsApp.'); });
    });
  }
})();

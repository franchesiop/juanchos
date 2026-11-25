// ==========================================
// JUANCHO'S - INTERACTIVIDAD
// ==========================================
(() => {
  'use strict';

  const TELEFONO = '584243371838'; // wa.me va sin "+"
  const wa = (texto) => `https://wa.me/${TELEFONO}?text=${encodeURIComponent(texto)}`;
  const $ = (sel, raiz = document) => raiz.querySelector(sel);
  const $$ = (sel, raiz = document) => [...raiz.querySelectorAll(sel)];
  const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------
     Año del pie
     ------------------------------------------ */
  $('#anio').textContent = new Date().getFullYear();

  /* ------------------------------------------
     Cabecera: se oscurece al bajar
     ------------------------------------------ */
  const cabecera = $('#cabecera');
  const alScroll = () => cabecera.classList.toggle('cabecera--fija', window.scrollY > 24);
  window.addEventListener('scroll', alScroll, { passive: true });
  alScroll();

  /* ------------------------------------------
     Menú móvil
     ------------------------------------------ */
  const botonNav = $('.nav__toggle');
  const listaNav = $('#nav-lista');

  const abrirNav = (abierto) => {
    botonNav.setAttribute('aria-expanded', String(abierto));
    botonNav.setAttribute('aria-label', abierto ? 'Cerrar menú de navegación' : 'Abrir menú de navegación');
    listaNav.classList.toggle('nav__lista--abierta', abierto);
  };

  botonNav.addEventListener('click', () => {
    abrirNav(botonNav.getAttribute('aria-expanded') !== 'true');
  });
  listaNav.addEventListener('click', (e) => { if (e.target.closest('a')) abrirNav(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') abrirNav(false); });

  /* ------------------------------------------
     Enlace activo según la sección visible
     ------------------------------------------ */
  const enlaces = $$('.nav__link');
  const observadorNav = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (!entrada.isIntersecting) return;
      const destino = '#' + entrada.target.dataset.nav;
      enlaces.forEach((enlace) => {
        const activo = enlace.getAttribute('href') === destino;
        enlace.classList.toggle('nav__link--activo', activo);
        if (activo) enlace.setAttribute('aria-current', 'page');
        else enlace.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  $$('[data-nav]').forEach((seccion) => observadorNav.observe(seccion));

  /* ------------------------------------------
     Estado del local (abierto / cerrado) en hora de Venezuela
     ------------------------------------------ */
  const HORARIO = { dias: [5, 6, 0], abre: 18, cierra: 23 }; // vie, sáb, dom · 6 pm a 11 pm
  const NOMBRE_DIA = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const CLAVE_DIA = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  function ahoraEnCaracas() {
    const partes = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Caracas',
      weekday: 'short',
      hour: 'numeric',
      hourCycle: 'h23'
    }).formatToParts(new Date());
    const valor = (tipo) => partes.find((p) => p.type === tipo).value;
    return { dia: CLAVE_DIA[valor('weekday')], hora: parseInt(valor('hour'), 10) };
  }

  function actualizarEstado() {
    const contenedor = $('#estado-local');
    const texto = $('#estado-texto');
    if (!contenedor || !texto) return;

    const { dia, hora } = ahoraEnCaracas();
    const abreHoy = HORARIO.dias.includes(dia);

    if (abreHoy && hora >= HORARIO.abre && hora < HORARIO.cierra) {
      contenedor.classList.add('estado--abierto');
      texto.textContent = 'Abierto ahora, hasta las 11:00 pm';
      return;
    }

    contenedor.classList.remove('estado--abierto');

    if (abreHoy && hora < HORARIO.abre) {
      texto.textContent = 'Cerrado ahora, abrimos hoy a las 6:00 pm';
      return;
    }

    for (let n = 1; n <= 7; n++) {
      const siguiente = (dia + n) % 7;
      if (HORARIO.dias.includes(siguiente)) {
        const cuando = n === 1 ? 'mañana' : `el ${NOMBRE_DIA[siguiente]}`;
        texto.textContent = `Cerrado ahora, abrimos ${cuando} a las 6:00 pm`;
        return;
      }
    }
  }

  actualizarEstado();
  setInterval(actualizarEstado, 60000);

  /* ------------------------------------------
     Entrada de las tarjetas del menú (una sola vez)
     ------------------------------------------ */
  const platos = $$('.plato');
  if (!sinMovimiento && 'IntersectionObserver' in window) {
    const observadorPlatos = new IntersectionObserver((entradas, obs) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;
        entrada.target.classList.add('plato--visible');
        obs.unobserve(entrada.target);
      });
    }, { threshold: 0.2 });

    platos.forEach((plato, i) => {
      plato.style.setProperty('--i', i);
      observadorPlatos.observe(plato);
    });
  } else {
    platos.forEach((plato) => { plato.style.opacity = 1; });
  }

  /* ------------------------------------------
     Filtros del menú (se ven solo en teléfono)
     ------------------------------------------ */
  const botonesFiltro = $$('.filtro');
  botonesFiltro.forEach((boton) => {
    boton.addEventListener('click', () => {
      const filtro = boton.dataset.filtro;
      botonesFiltro.forEach((b) => b.setAttribute('aria-pressed', String(b === boton)));
      platos.forEach((plato) => {
        const coincide = filtro === 'todos' || plato.dataset.cat === filtro;
        plato.toggleAttribute('data-oculto', !coincide);
        if (coincide) plato.classList.add('plato--visible');
      });
    });
  });

  /* ------------------------------------------
     Ventana de detalle de plato (<dialog>)
     Cierra con la X, con Escape o tocando fuera.
     ------------------------------------------ */
  const ventana = $('#detalle');
  const campos = {
    img: $('#detalle-img'),
    cat: $('#detalle-cat'),
    titulo: $('#detalle-titulo'),
    precio: $('#detalle-precio'),
    ingredientes: $('#detalle-ing'),
    pedir: $('#detalle-pedir')
  };

  /* ---- Visor de fotos (flechas, puntos, teclado y deslizar) ---- */
  const visor = {
    caja: $('#detalle-foto'),
    prev: $('#visor-prev'),
    next: $('#visor-next'),
    puntos: $('#visor-puntos'),
    fotos: [],
    i: 0,
    token: 0
  };

  function pintarPuntos() {
    visor.puntos.innerHTML = '';
    visor.fotos.forEach((_, n) => {
      const p = document.createElement('button');
      p.type = 'button';
      p.className = 'visor__punto' + (n === visor.i ? ' visor__punto--activo' : '');
      p.setAttribute('aria-label', `Ver foto ${n + 1} de ${visor.fotos.length}`);
      p.addEventListener('click', () => irAFoto(n));
      visor.puntos.appendChild(p);
    });
    visor.caja.classList.toggle('detalle__foto--una', visor.fotos.length < 2);
  }

  function irAFoto(n) {
    const total = visor.fotos.length;
    if (!total) return;
    visor.i = (n + total) % total;
    const img = campos.img;
    img.classList.add('cambiando');
    setTimeout(() => {
      img.src = visor.fotos[visor.i];
      img.classList.remove('cambiando');
    }, sinMovimiento ? 0 : 120);
    $$('.visor__punto', visor.puntos).forEach((p, n2) => p.classList.toggle('visor__punto--activo', n2 === visor.i));
  }

  // Solo se suman las fotos que realmente existen
  function cargarFotos(candidatas) {
    const token = ++visor.token;
    visor.fotos = [];
    visor.i = 0;
    campos.img.removeAttribute('src');
    pintarPuntos();
    candidatas.forEach((url) => {
      const prueba = new Image();
      prueba.onload = () => {
        if (token !== visor.token) return;
        const actual = visor.fotos[visor.i];
        visor.fotos.push(url);
        visor.fotos.sort((a, b) => candidatas.indexOf(a) - candidatas.indexOf(b));
        if (actual === undefined) { visor.i = 0; campos.img.src = visor.fotos[0]; }
        else visor.i = visor.fotos.indexOf(actual);
        pintarPuntos();
      };
      prueba.src = url;
    });
  }

  visor.prev.addEventListener('click', () => irAFoto(visor.i - 1));
  visor.next.addEventListener('click', () => irAFoto(visor.i + 1));
  ventana.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') irAFoto(visor.i - 1);
    if (e.key === 'ArrowRight') irAFoto(visor.i + 1);
  });
  let inicioX = null;
  visor.caja.addEventListener('pointerdown', (e) => { inicioX = e.clientX; });
  visor.caja.addEventListener('pointerup', (e) => {
    if (inicioX === null) return;
    const dx = e.clientX - inicioX;
    inicioX = null;
    if (Math.abs(dx) > 40) irAFoto(visor.i + (dx < 0 ? 1 : -1));
  });

  /* Si la foto de una tarjeta no existe, se muestra un recuadro con el nombre */
  $$('.plato__foto').forEach((caja) => {
    const img = $('img', caja);
    caja.dataset.nombre = $('.plato__titulo', caja.closest('.plato')).textContent.trim();
    const falla = () => caja.classList.add('plato__foto--vacia');
    img.addEventListener('error', falla);
    if (img.complete && img.naturalWidth === 0 && img.getAttribute('loading') !== 'lazy') falla();
  });

  function abrirDetalle(plato, boton) {
    const foto = $('img', plato);
    const titulo = $('.plato__titulo', plato).textContent.trim();
    const precio = $('.plato__precio', plato).textContent.trim();

    const primera = foto.currentSrc || foto.src;
    const extras = (boton.dataset.extras || '').split('|').map((s) => s.trim()).filter(Boolean);
    campos.img.alt = foto.alt;
    cargarFotos([primera, ...extras]);
    campos.cat.textContent = $('.plato__cat', plato).textContent;
    campos.titulo.textContent = titulo;
    campos.precio.textContent = precio;
    campos.ingredientes.textContent = boton.dataset.ingredientes;
    campos.pedir.href = wa(`Hola Juancho's, quiero pedir: ${titulo} (${precio})`);

    ventana.classList.remove('detalle--saliendo');
    ventana.showModal();
  }

  function cerrarDetalle() {
    if (!ventana.open) return;
    if (sinMovimiento) { ventana.close(); return; }

    ventana.classList.add('detalle--saliendo');
    ventana.addEventListener('animationend', function alTerminar(e) {
      if (e.target !== ventana) return;
      ventana.removeEventListener('animationend', alTerminar);
      ventana.close();
      ventana.classList.remove('detalle--saliendo');
    });
  }

  $$('.plato__abrir').forEach((boton) => {
    boton.addEventListener('click', () => abrirDetalle(boton.closest('.plato'), boton));
  });

  $('.detalle__cerrar').addEventListener('click', cerrarDetalle);
  ventana.addEventListener('cancel', (e) => { e.preventDefault(); cerrarDetalle(); });
  ventana.addEventListener('click', (e) => { if (e.target === ventana) cerrarDetalle(); });
})();
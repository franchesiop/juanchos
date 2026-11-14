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

  function abrirDetalle(plato, boton) {
    const foto = $('img', plato);
    const titulo = $('.plato__titulo', plato).textContent.trim();
    const precio = $('.plato__precio', plato).textContent.trim();

    campos.img.src = foto.currentSrc || foto.src;
    campos.img.alt = foto.alt;
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
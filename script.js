// ==========================================
// JUANCHO'S - INTERACTIVIDAD Y ANIMACIONES
// ==========================================

document.addEventListener('DOMContentLoaded', () => {

  /* ------------------------------------------
     1. INDICADOR DEL MENÚ ACTIVO SEGÚN EL SCROLL
     ------------------------------------------ */
  const secciones = document.querySelectorAll('section[data-section]');
  const navLinks = document.querySelectorAll('.nav-link');

  function actualizarMenuActivo() {
    let seccionActualId = '';
    const scrollPosicion = window.scrollY + 150; // Offset para detectar la sección antes de tocar el borde superior

    secciones.forEach(seccion => {
      const topSeccion = seccion.offsetTop;
      const altoSeccion = seccion.offsetHeight;

      if (scrollPosicion >= topSeccion && scrollPosicion < topSeccion + altoSeccion) {
        seccionActualId = seccion.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${seccionActualId}`) {
        link.classList.add('active');
      }
    });
  }

  // Escuchar el evento de scroll
  window.addEventListener('scroll', actualizarMenuActivo);


  /* ------------------------------------------
     2. VENTANA EMERGENTE (MODAL) DEL MENÚ
     ------------------------------------------ */
  
  // Base de datos local de los platillos para el modal
  const datosPlatillos = {
    1: {
      titulo: "Hamburguesa Especial",
      categoria: "Hamburguesas",
      precio: "$6.00",
      ingredientes: "Pan brioche artesanal tostado con mantequilla, 150g de carne jugosa de res, Doble Queso Cheddar fundido, Tocineta Ahumada crujiente, Lechuga fresca, Tomate y Cebolla Morada. Acompañada de salsas de la casa y 100g de papas naturales.",
      imagen: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80"
    },
    2: {
      titulo: "Papas Juancho's",
      categoria: "Papas & Entradas",
      precio: "$4.50",
      ingredientes: "300g de papas fritas naturales doradas al punto exacto, bañadas en abundante salsa fundida de Queso Cheddar y trozos crujientes de tocineta ahumada artesanal.",
      imagen: "https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80"
    },
    3: {
      titulo: "Tequeños Crujientes",
      categoria: "Entradas",
      precio: "$3.50",
      ingredientes: "6 unidades de tequeños de masa suave y crujiente, super rellenos de queso blanco fundido de alta calidad. Ideales para compartir como entrada.",
      imagen: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=600&q=80"
    }
  };

  const modalOverlay = document.getElementById('modal-platillo');
  const btnCerrarModal = document.getElementById('btn-close-modal');
  const tarjetasPlatillo = document.querySelectorAll('.card-platillo');

  // Elementos internos del modal a rellenar
  const modalTitulo = document.getElementById('modal-titulo');
  const modalCategoria = document.getElementById('modal-categoria');
  const modalPrecio = document.getElementById('modal-precio');
  const modalIngredientes = document.getElementById('modal-ingredientes');
  const modalImg = document.getElementById('modal-img-principal');

  // Abrir Modal al hacer clic en una tarjeta
  tarjetasPlatillo.forEach(tarjeta => {
    tarjeta.addEventListener('click', () => {
      const idPlatillo = tarjeta.getAttribute('data-id');
      const info = datosPlatillos[idPlatillo];

      if (info) {
        modalTitulo.textContent = info.titulo;
        modalCategoria.textContent = info.categoria;
        modalPrecio.textContent = info.precio;
        modalIngredientes.textContent = info.ingredientes;
        modalImg.src = info.imagen;

        modalOverlay.classList.add('active');
      }
    });
  });

  // Cerrar Modal con el botón X
  if (btnCerrarModal) {
    btnCerrarModal.addEventListener('click', () => {
      modalOverlay.classList.remove('active');
    });
  }

  // Cerrar Modal al hacer clic fuera del contenido
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        modalOverlay.classList.remove('active');
      }
    });
  }

});
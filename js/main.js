/* Blu café — interacciones del sitio */
document.documentElement.classList.add("js");

/* 1. Menú hamburguesa (celular) */
const burger = document.querySelector(".burger");
const nav = document.getElementById("nav");
if (burger && nav) {
  burger.addEventListener("click", () => {
    const abierto = nav.classList.toggle("abierto");
    burger.setAttribute("aria-expanded", abierto);
    burger.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
  });
}

/* 2. Carta: pestañas por categoría (menu.html) */
const cats = document.querySelector(".cats");
if (cats) {
  const links = [...cats.querySelectorAll("a")];
  const secciones = [...document.querySelectorAll(".categoria")];
  const mostrar = (id, scroll) => {
    if (!secciones.some(s => s.id === id)) id = secciones[0].id;
    secciones.forEach(s => s.classList.toggle("activa", s.id === id));
    links.forEach(a => a.setAttribute("aria-current", a.hash === "#" + id));
    const activo = links.find(a => a.hash === "#" + id);
    if (activo) activo.scrollIntoView({ block: "nearest", inline: "center" });
    if (scroll) window.scrollTo({ top: 0, behavior: "smooth" });
  };
  cats.addEventListener("click", e => {
    const a = e.target.closest("a");
    if (!a) return;
    e.preventDefault();
    history.replaceState(null, "", a.hash);
    mostrar(a.hash.slice(1), true);
  });
  window.addEventListener("hashchange", () => mostrar(location.hash.slice(1), true));
  mostrar(location.hash.slice(1), false);
}

/* 3. Visor de fotos de productos */
const visor = document.getElementById("visor");
if (visor && visor.showModal) {
  const img = visor.querySelector("img");
  const txt = visor.querySelector(".visor-nombre");
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-foto]");
    if (!b) return;
    img.src = b.dataset.foto;
    img.alt = b.dataset.nombre;
    txt.textContent = b.dataset.nombre;
    visor.showModal();
  });
  visor.addEventListener("click", e => {
    if (e.target === visor || e.target.closest(".visor-cerrar")) visor.close();
  });
}

/* 4. "Nuestra historia" desplegable (sobre.html) */
const btnHistoria = document.getElementById("btn-historia");
const historia = document.getElementById("historia");
if (btnHistoria && historia) {
  btnHistoria.addEventListener("click", () => {
    const abierta = historia.classList.toggle("abierta");
    btnHistoria.setAttribute("aria-expanded", abierta);
    btnHistoria.textContent = abierta ? "Ver menos" : "Nuestra historia";
  });
}

/* 5. Horarios: resalta el día de hoy (info.html) */
const filaHoy = document.querySelector(`.tabla-horarios tr[data-dia="${new Date().getDay()}"]`);
if (filaHoy) filaHoy.classList.add("hoy");

/* 6. Formulario de contacto: validación */
const form = document.getElementById("form");
if (form) {
  const error = document.getElementById("error");
  const gracias = document.getElementById("gracias");
  form.addEventListener("submit", e => {
    e.preventDefault();
    const faltan = [];
    if (!form.nombre.value.trim()) faltan.push("tu nombre");
    if (!/^\S+@\S+\.\S+$/.test(form.mail.value.trim())) faltan.push("un mail válido");
    if (!form.mensaje.value.trim()) faltan.push("tu mensaje");
    if (faltan.length) {
      gracias.hidden = true;
      error.textContent = "Completá " + faltan.join(", ") + " para enviar.";
      error.hidden = false;
      return;
    }
    error.hidden = true;
    form.reset();
    gracias.hidden = false;
  });
  form.addEventListener("input", () => { gracias.hidden = true; });
}

/* 7. Video: se reproduce solo cuando está a la vista */
const video = document.querySelector("video[data-autoplay]");
if (video && "IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting) video.play().catch(() => {});
    else video.pause();
  }, { threshold: 0.4 }).observe(video);
}

/* 8. Carrito de compras (todas las páginas cuentan; la tienda lo muestra) */
const CLAVE = "blu-carrito";
const pesos = n => "$ " + n.toLocaleString("es-AR");
const leer = () => { try { return JSON.parse(localStorage.getItem(CLAVE)) || []; } catch { return []; } };
let carrito = leer();
const guardar = () => { try { localStorage.setItem(CLAVE, JSON.stringify(carrito)); } catch {} };
const cantidadTotal = () => carrito.reduce((s, p) => s + p.cant, 0);
const total = () => carrito.reduce((s, p) => s + p.cant * p.precio, 0);

function pintarContador(saltar) {
  document.querySelectorAll("[data-carrito-num]").forEach(n => {
    const c = cantidadTotal();
    n.textContent = c;
    n.hidden = c === 0;
    if (saltar) { n.classList.remove("salta"); void n.offsetWidth; n.classList.add("salta"); }
  });
}

const lista = document.querySelector("[data-lista]");
function pintarCarrito() {
  pintarContador();
  if (!lista) return;
  lista.innerHTML = "";
  carrito.forEach(p => {
    const li = document.createElement("li");
    li.className = "linea";
    li.innerHTML = `<img src="${p.foto}" alt=""><div><h3></h3><p class="linea-precio">${pesos(p.precio * p.cant)}</p></div>
      <div class="cantidad"><button type="button" data-menos aria-label="Quitar uno">−</button><span>${p.cant}</span><button type="button" data-mas aria-label="Sumar uno">+</button></div>`;
    li.querySelector("h3").textContent = p.nombre;
    li.querySelector("[data-menos]").addEventListener("click", () => cambiar(p.id, -1));
    li.querySelector("[data-mas]").addEventListener("click", () => cambiar(p.id, 1));
    lista.append(li);
  });
  const vacio = carrito.length === 0;
  document.querySelector("[data-vacio]").hidden = !vacio;
  document.querySelector("[data-total]").textContent = pesos(total());
  document.querySelector("[data-comprar]").disabled = vacio;
  document.querySelector("[data-vaciar]").hidden = vacio;
  const flot = document.querySelector("[data-flotante]");
  flot.hidden = vacio;
  document.querySelector("[data-flotante-txt]").textContent = `${cantidadTotal()} · ${pesos(total())}`;
}

function anunciar(txt) { const a = document.querySelector("[data-anuncio]"); if (a) a.textContent = txt; }

function cambiar(id, d) {
  const p = carrito.find(x => x.id === id);
  if (!p) return;
  p.cant += d;
  if (p.cant <= 0) carrito = carrito.filter(x => x.id !== id);
  guardar(); pintarCarrito();
  anunciar(`${p.nombre}: ${Math.max(p.cant, 0)} en el carrito`);
}

document.querySelectorAll("[data-agregar]").forEach(b => {
  b.addEventListener("click", () => {
    const { id, nombre, foto } = b.dataset;
    const precio = Number(b.dataset.precio);
    const p = carrito.find(x => x.id === id);
    if (p) p.cant++; else carrito.push({ id, nombre, precio, foto, cant: 1 });
    guardar(); pintarCarrito(); pintarContador(true);
    anunciar(`Agregaste ${nombre} al carrito`);
    b.textContent = "¡Agregado!"; b.classList.add("agregado");
    setTimeout(() => { b.textContent = "Agregar"; b.classList.remove("agregado"); }, 1200);
  });
});

/* Filtros de la tienda */
const filtros = document.querySelectorAll("[data-filtro]");
filtros.forEach(f => f.addEventListener("click", () => {
  filtros.forEach(x => x.setAttribute("aria-pressed", x === f));
  document.querySelectorAll(".producto").forEach(p => {
    p.hidden = !(f.dataset.filtro === "todo" || p.dataset.cat === f.dataset.filtro);
  });
}));

/* Vaciar y finalizar compra (simulación) */
const checkout = document.getElementById("checkout");
if (lista && checkout) {
  document.querySelector("[data-vaciar]").addEventListener("click", () => { carrito = []; guardar(); pintarCarrito(); anunciar("Vaciaste el carrito"); });
  const formCompra = checkout.querySelector("[data-form-compra]");
  const ok = checkout.querySelector("[data-ok]");
  const err = checkout.querySelector("[data-error-compra]");
  document.querySelector("[data-comprar]").addEventListener("click", () => {
    const res = checkout.querySelector("[data-resumen]");
    res.innerHTML = "";
    carrito.forEach(p => {
      const li = document.createElement("li");
      li.innerHTML = `<span></span><span>${pesos(p.precio * p.cant)}</span>`;
      li.firstChild.textContent = `${p.cant} × ${p.nombre}`;
      res.append(li);
    });
    checkout.querySelector("[data-resumen-total]").textContent = pesos(total());
    formCompra.hidden = false; ok.hidden = true; err.hidden = true;
    checkout.showModal();
  });
  formCompra.addEventListener("submit", e => {
    e.preventDefault();
    const faltan = [];
    if (!formCompra.nombre.value.trim()) faltan.push("tu nombre");
    if (!/^\S+@\S+\.\S+$/.test(formCompra.mail.value.trim())) faltan.push("un mail válido");
    if (faltan.length) { err.textContent = "Completá " + faltan.join(" y ") + "."; err.hidden = false; return; }
    checkout.querySelector("[data-ok-txt]").textContent =
      `${formCompra.nombre.value.trim().split(" ")[0]}, te esperamos en el local para retirar tu pedido de ${pesos(total())} (pago: ${formCompra.pago.value}).`;
    carrito = []; guardar(); pintarCarrito(); formCompra.reset();
    formCompra.hidden = true; ok.hidden = false;
  });
  checkout.querySelectorAll("[data-cerrar-checkout]").forEach(b => b.addEventListener("click", () => checkout.close()));
}
pintarCarrito();

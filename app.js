"use strict";

const main = document.querySelector("main");
const slides = [...main.querySelectorAll(".slide")];
const nav = document.querySelector(".main-nav");
const links = [...nav.querySelectorAll("a")];
const previous = document.querySelector("#anterior");
const next = document.querySelector("#siguiente");
const counter = document.querySelector("#counter");
const progress = document.querySelector("#progress");
const fullscreen = document.querySelector("#pantalla");
const photoDialog = document.querySelector("#foto");
let current = 0;

function renderSlide() {
  const hash = location.hash.slice(1);
  const aliases = {reenvio: "registro", simulados: "visualizacion", validacion: "resultados"};
  const slug = aliases[hash] ?? hash;
  if (slug === main.id) return;
  current = Math.max(0, slides.findIndex(slide => slide.id === slug));
  for (const [i, slide] of slides.entries()) {
    slide.hidden = i !== current;
    if (i === current) links[i].setAttribute("aria-current", "page");
    else links[i].removeAttribute("aria-current");
  }
  const active = links[current];
  if (nav.scrollWidth > nav.clientWidth) {
    nav.scrollLeft = active.getBoundingClientRect().left - nav.getBoundingClientRect().left
      + nav.scrollLeft - nav.clientWidth / 2 + active.clientWidth / 2;
  }
  previous.disabled = current === 0;
  document.querySelector("#anterior-nombre").textContent = links[current - 1]?.textContent ?? "Anterior";
  document.querySelector("#siguiente-nombre").textContent = links[current + 1]?.textContent ?? "Volver al inicio";
  counter.textContent = String(current + 1).padStart(2, "0") + " / " + String(slides.length).padStart(2, "0");
  progress.max = slides.length;
  progress.value = current + 1;
  main.scrollTop = 0;
}

function goTo(index) {
  if (index >= 0 && index < slides.length) location.hash = slides[index].id;
}

previous.addEventListener("click", () => goTo(current - 1));
next.addEventListener("click", () => goTo(current === slides.length - 1 ? 0 : current + 1));
window.addEventListener("hashchange", renderSlide);

async function toggleFullscreen() {
  if (!document.fullscreenEnabled) return;
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch {
    fullscreen.title = "El navegador no permitió activar pantalla completa";
  }
}
fullscreen.hidden = !document.fullscreenEnabled;
fullscreen.addEventListener("click", toggleFullscreen);
document.addEventListener("fullscreenchange", () => {
  const label = document.fullscreenElement ? "Salir de pantalla completa" : "Pantalla completa";
  fullscreen.setAttribute("aria-label", label);
  fullscreen.title = label + " (F)";
});

document.addEventListener("keydown", event => {
  if (photoDialog.open || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  if (event.target.matches("input, select, textarea, [contenteditable]")) return;
  if (event.key === "ArrowRight" || event.key === "PageDown" || (event.key === " " && !event.target.closest("button, a"))) {
    event.preventDefault();
    goTo(current + 1);
  } else if (event.key === "ArrowLeft" || event.key === "PageUp") {
    event.preventDefault();
    goTo(current - 1);
  } else if (event.key === "Home" || event.key === "End") {
    event.preventDefault();
    goTo(event.key === "Home" ? 0 : slides.length - 1);
  } else if (/^[1-9]$/.test(event.key)) {
    goTo(Number(event.key) - 1);
  } else if (event.key.toLowerCase() === "f") {
    toggleFullscreen();
  } else if (event.key.toLowerCase() === "p") {
    document.body.classList.toggle("motion-paused");
  }
});

let touchStart;
main.addEventListener("touchstart", event => {
  if (event.touches.length === 1 && !event.target.closest("button, a, input, label")) {
    const {clientX, clientY} = event.touches[0];
    touchStart = {x: clientX, y: clientY};
  }
}, {passive: true});
main.addEventListener("touchend", event => {
  const start = touchStart;
  touchStart = undefined;
  if (!start || event.changedTouches.length !== 1) return;
  const {clientX, clientY} = event.changedTouches[0];
  const dx = clientX - start.x;
  const dy = clientY - start.y;
  if (Math.abs(dx) > 60 && Math.abs(dx) > 1.6 * Math.abs(dy)) goTo(current + (dx < 0 ? 1 : -1));
}, {passive: true});
main.addEventListener("touchcancel", () => { touchStart = undefined; }, {passive: true});

for (const trigger of document.querySelectorAll("[data-photo]")) {
  trigger.addEventListener("click", () => {
    const img = photoDialog.querySelector("img");
    img.src = trigger.dataset.photo;
    img.alt = trigger.dataset.caption || trigger.querySelector("img")?.alt || "Fotografía";
    photoDialog.showModal();
  });
}
photoDialog.querySelector("button").addEventListener("click", () => photoDialog.close());
photoDialog.addEventListener("click", event => {
  if (event.target === photoDialog) photoDialog.close();
});

renderSlide();

{
  const layout = document.querySelector(".territory-layout");
  const viewer = document.querySelector("#flood-photo");
  const heading = document.querySelector("#flood-title");
  const dotGroup = document.querySelector(".photo-dots");
  const markers = [...layout.querySelectorAll(".map-point")];
  const overlay = document.querySelector("#flood-link");
  const arrow = document.querySelector("#flood-link-line");
  let selected = 0;
  let frame;

  function updateArrow() {
    if (!viewer.clientWidth || !layout.clientWidth) return;
    const l = layout.getBoundingClientRect();
    const m = markers[selected].getBoundingClientRect();
    const box = viewer.getBoundingClientRect();
    const x = m.left - l.left + m.width / 2;
    const y = m.top - l.top + m.height / 2;
    const beside = box.left > m.right + 20;
    const endX = (beside ? box.left - 7 : box.left + box.width / 2) - l.left;
    const endY = (beside ? box.top + box.height / 2 : box.top - 7) - l.top;
    const dx = endX - x;
    const dy = endY - y;
    const radius = m.width / 2 + 3;
    const length = Math.hypot(dx, dy) || 1;
    const startX = x + dx * radius / length;
    const startY = y + dy * radius / length;
    overlay.setAttribute("viewBox", `0 0 ${l.width} ${l.height}`);
    arrow.setAttribute("d", beside
      ? `M${startX} ${startY}C${startX + dx * .5} ${startY} ${endX - 40} ${endY} ${endX} ${endY}`
      : `M${startX} ${startY}C${Math.max(startX, l.width - 20)} ${startY + 45} ${endX} ${endY - 45} ${endX} ${endY}`);
  }

  function scheduleArrow() {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(updateArrow);
  }

  const dots = fotosDesafio.map(({caption}, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("aria-label", "Ver " + caption.toLowerCase());
    button.addEventListener("click", () => showFlood(index));
    dotGroup.append(button);
    return button;
  });

  function showFlood(index) {
    selected = index;
    const {src, caption} = fotosDesafio[index];
    const image = new Image();
    image.src = src;
    image.alt = caption;
    viewer.replaceChildren(image);
    heading.textContent = caption;
    for (const controls of [markers, dots]) {
      controls.forEach((control, i) => {
        control.classList.toggle("selected", i === index);
        control.setAttribute("aria-pressed", String(i === index));
      });
    }
    scheduleArrow();
  }

  markers.forEach((marker, index) => marker.addEventListener("click", () => showFlood(index)));
  new ResizeObserver(scheduleArrow).observe(layout);
  window.addEventListener("hashchange", scheduleArrow);
  showFlood(0);
}

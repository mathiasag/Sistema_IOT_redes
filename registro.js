"use strict";

(() => {
  const page = document.querySelector("#registro");
  const body = page.querySelector("#registro-filas");
  const flow = page.querySelector("#flujo-registro");
  const message = page.querySelector("#registro-mensaje");
  const network = page.querySelector("#cambiar-red");
  const sensor = page.querySelector("#cambiar-sensor");
  const networkState = page.querySelector("#estado-red");
  const sensorState = page.querySelector("#estado-sensor");
  const pendingCount = page.querySelector("#pendientes");
  const savedCount = page.querySelector("#guardadas");
  const networkAction = page.querySelector("#accion-red");
  const sensorAction = page.querySelector("#accion-sensor");
  const interval = 5 * 60 * 1000;
  const firstSample = Date.UTC(2026, 10, 20, 4, 20);
  const values = [
    0.868, 0.873, 0.889, 0.929, 1.012, 1.151, 1.328, 1.522, 1.688, 1.746,
    1.719, 1.648, 1.542, 1.424, 1.303, 1.197, 1.105, 1.029, 0.969, 0.926,
    0.897, 0.879, 0.871, 0.868
  ];
  const pending = [];
  const localRecords = [];
  let online, healthy, nextMeasurement, nextId, lastInsertion;
  const transfers = [];

  function timestampCell(row, instant) {
    const iso = new Date(instant).toISOString();
    const time = document.createElement("time");
    time.dateTime = iso.slice(0, 19);
    const [date, hour] = time.dateTime.split("T");
    const timePart = document.createElement("span");
    timePart.textContent = hour;
    time.append(date, " ", timePart);
    row.insertCell().append(time);
  }

  function showReading(record, arrival) {
    const {id, timestamp, level, createdAt, status} = record;
    const colors = {OK: "ok", FALLA_SENSOR: "falla", RECUPERADO: "recuperado"};
    const row = body.insertRow(0);
    row.className = "server-row";
    row.dataset.status = status;
    row.style.setProperty("--arrival", arrival + "ms");
    row.insertCell().textContent = id;
    timestampCell(row, timestamp);
    row.insertCell().textContent = level.toFixed(3);
    timestampCell(row, createdAt);
    const label = document.createElement("span");
    label.className = "status-code status-" + colors[status];
    label.textContent = status;
    row.insertCell().append(label);
  }

  function insertMeasurement(reading, createdAt, arrival = 0) {
    const lag = createdAt - reading.timestamp;
    const status = reading.level < 0 ? "FALLA_SENSOR" : lag > 120_000 ? "RECUPERADO" : "OK";
    const record = {...reading, id: nextId++, createdAt, status};
    showReading(record, arrival);
    lastInsertion = createdAt;
    return status;
  }

  function update() {
    pendingCount.textContent = pending.length;
    savedCount.textContent = localRecords.length;
    networkState.textContent = online ? "Activo" : "Sin red";
    networkState.dataset.active = String(online);
    networkAction.textContent = online ? "Cortar conexión" : "Restaurar conexión";
    network.setAttribute("aria-pressed", String(!online));
    sensorState.textContent = healthy ? "Operativo" : "En falla";
    sensorState.dataset.active = String(healthy);
    sensorAction.textContent = healthy ? "Simular falla" : "Restaurar sensor";
    sensor.setAttribute("aria-pressed", String(!healthy));
  }

  function showRoute(route, animate) {
    flow.dataset.flow = route;
    for (const animation of transfers.splice(0)) animation.cancel();
    if (!animate || matchMedia("(prefers-reduced-motion: reduce)").matches
      || document.body.classList.contains("motion-paused")) return;

    function animateLeg(leg, delay, duration) {
      const path = flow.querySelector(".packet-" + leg);
      const distance = path.getTotalLength();
      transfers.push(path.animate([
        {strokeDashoffset: 16, opacity: 0},
        {opacity: 1, offset: .12},
        {opacity: 1, offset: .8},
        {strokeDashoffset: -distance, opacity: 0}
      ], {duration, delay, easing: "linear"}));
    }

    if (route !== "recovery") animateLeg("save", 0, 460);
    if (route !== "queue") animateLeg("send", route === "direct" ? 460 : 0, 570);
  }

  function takeReading(arrival = 0) {
    const slot = (nextMeasurement - firstSample) / interval;
    const reading = {timestamp: nextMeasurement, level: healthy ? values[slot % values.length] : -1};
    nextMeasurement += interval;
    localRecords.push(reading);
    if (!online) {
      pending.push(reading);
      return;
    }
    return insertMeasurement(reading, reading.timestamp + 2000, arrival);
  }

  page.querySelector("#medir").addEventListener("click", () => {
    const status = takeReading();
    showRoute(online ? "direct" : "queue", true);
    if (!online) {
      message.textContent = "Guardada en microSD. La fila aparecerá al restaurar internet.";
    } else {
      message.textContent = status === "OK"
        ? "Guardada en microSD y registrada como OK en el servidor."
        : "Falla guardada en microSD y registrada como FALLA_SENSOR en el servidor.";
    }
    update();
  });

  page.querySelector("#simular-crecida").addEventListener("click", () => {
    const slot = (nextMeasurement - firstSample) / interval;
    const remaining = values.length - (slot % values.length);
    for (let i = 0; i < remaining; i++) takeReading(Math.min(5, i) * 70);
    showRoute(online ? "direct" : "queue", true);
    message.textContent = online
      ? remaining + " lecturas generadas cada 5 min y publicadas en el servidor simulado."
      : remaining + " lecturas guardadas en microSD. Restaura internet para publicarlas.";
    update();
  });

  network.addEventListener("click", () => {
    online = !online;
    if (!online || pending.length === 0) {
      showRoute(online ? "direct" : "queue", false);
      message.textContent = online
        ? "Internet restaurado. La cola está vacía."
        : "Internet interrumpido. Las lecturas nuevas quedan en microSD.";
    } else {
      const batch = pending.splice(0);
      const availability = Math.max(batch.at(-1).timestamp + 180_000, lastInsertion + 1000);
      let recovered = 0;
      batch.forEach((reading, i) => {
        const status = insertMeasurement(reading, availability + i * 1000, 100 + Math.min(i, 5) * 95);
        if (status === "RECUPERADO") recovered++;
      });
      showRoute("recovery", true);
      message.textContent = "Lecturas pendientes enviadas: " + batch.length
        + ". RECUPERADO: " + recovered + (recovered < batch.length ? ". FALLA_SENSOR: " + (batch.length - recovered) : "") + ".";
    }
    update();
  });

  sensor.addEventListener("click", () => {
    healthy = !healthy;
    message.textContent = healthy
      ? "Sensor operativo. La siguiente lectura tendrá un valor válido."
      : "Sensor en falla. Toma una lectura para ver cómo se registra.";
    update();
  });

  function reset() {
    online = healthy = true;
    nextMeasurement = firstSample + interval;
    nextId = 11400;
    pending.length = 0;
    body.replaceChildren();
    const sample = {timestamp: firstSample, level: values[0]};
    localRecords.splice(0, localRecords.length, sample);
    insertMeasurement(sample, firstSample + 2000);
    body.closest(".server-table").scrollTop = 0;
    showRoute("direct", false);
    message.textContent = "Cada lectura se guarda primero en la microSD.";
    update();
  }

  page.querySelector("#reiniciar").addEventListener("click", reset);
  reset();
})();

"use strict";

(() => {
  const compact = matchMedia("(max-width: 630px)");
  const drawings = {
    pcb: `<rect x="-45" y="-34" width="90" height="68" rx="8" fill="#e5f6ff" stroke="#19315e" stroke-width="2.5"/>
      <path d="M-35 -15H-22M-35 0H-22M-35 15H-22M22 -15H35M22 0H35M22 15H35M-13 -22V-13M0 -22V-13M13 -22V-13M-13 13V22M0 13V22M13 13V22" stroke="#0968d6" stroke-width="2.4" stroke-linecap="round"/>
      <rect x="-22" y="-13" width="44" height="26" rx="4" fill="#19315e"/><circle cx="34" cy="-23" r="4" fill="#159acb"/>
      <circle cx="-35" cy="-24" r="3" fill="#fff" stroke="#4d8dbb"/><circle cx="35" cy="24" r="3" fill="#fff" stroke="#4d8dbb"/>`,
    server: `<rect x="-37" y="-34" width="74" height="65" rx="7" fill="#19315e"/>
      <rect x="-29" y="-24" width="58" height="17" rx="4" fill="#285487"/><rect x="-29" y="-2" width="58" height="17" rx="4" fill="#285487"/>
      <circle cx="-19" cy="-16" r="3" fill="#56dbef"/><circle cx="-19" cy="6" r="3" fill="#56dbef"/>
      <path d="M-9 -16H17M-9 6H17M-26 29V35M26 29V35" stroke="#addaff" stroke-width="3" stroke-linecap="round"/>`,
    monitor: `<rect x="-49" y="-32" width="98" height="63" rx="6" fill="#fff" stroke="#19315e" stroke-width="3"/>
      <path d="M-47 -20H47M0 31V39M-20 40H20" stroke="#19315e" stroke-width="3" stroke-linecap="round"/>
      <circle cx="-39" cy="-26" r="2" fill="#56dbef"/><circle cx="-32" cy="-26" r="2" fill="#56dbef"/>
      <path d="M-35 15V-9M-35 15H34" stroke="#c8e2fa" stroke-width="2" fill="none"/>
      <path d="M-30 10C-24 9 -21 11 -16 8S-9 7 -4 2 3 -12 9 -11 14 -6 18 -5 25 -2 28 0 32 4 35 4V15H-30Z" fill="#b9e8fa"/>
      <path d="M-30 10C-24 9 -21 11 -16 8S-9 7 -4 2 3 -12 9 -11 14 -6 18 -5 25 -2 28 0 32 4 35 4" stroke="#0968d6" stroke-width="2.7" stroke-linecap="round" fill="none"/>`,
    sd: `<path d="M-24 -14L-8 -30H24Q29 -30 29 -25V26Q29 30 24 30H-24Q-28 30-28 25V-9Z" fill="#19315e"/>
      <path d="M-7 -21V-10M1 -21V-10M9 -21V-10M17 -21V-10" stroke="#83d8eb" stroke-width="3" stroke-linecap="round"/>
      <rect x="-17" y="1" width="35" height="17" rx="4" fill="#dbf1ff"/><path d="M-10 10H10" stroke="#156bc7" stroke-width="2.5" stroke-linecap="round"/>`,
    radar: `<path d="M-18 -22V-32H19V-22" fill="none" stroke="#19315e" stroke-width="4"/>
      <rect x="-39" y="-20" width="78" height="26" rx="7" fill="#daeefd" stroke="#19315e" stroke-width="3"/>
      <path d="M-24 13Q0 28 24 13M-13 10Q0 19 13 10" fill="none" stroke="#1889d7" stroke-width="3" stroke-linecap="round"/>`,
    pc: `<path d="M-41 17H41L51 29H-51Z" fill="#d3eaff" stroke="#19315e" stroke-width="3" stroke-linejoin="round"/>
      <rect x="-38" y="-26" width="76" height="44" rx="5" fill="#fff" stroke="#19315e" stroke-width="3"/>
      <path d="M-27 -14H14M-27 -5H24M-27 4H7" stroke="#2490db" stroke-width="3" stroke-linecap="round"/>`
  };

  function text(x, y, value, className = "diagram-label") {
    return `<text x="${x}" y="${y}" class="${className}">${value}</text>`;
  }

  function icon(kind, x, y, scale = 1) {
    return `<g transform="translate(${x} ${y}) scale(${scale})">${drawings[kind]}</g>`;
  }

  function arrow(name, color = "#558ac0") {
    return `<defs><marker id="${name}" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="${color}"/></marker></defs>`;
  }

  function wire(path, marker, type = "", motion = true) {
    return `<path d="${path}" class="diagram-wire ${type}" marker-end="url(#${marker})"/>
      ${motion ? `<path d="${path}" class="diagram-pulse ${type}"/>` : ""}`;
  }

  function setDiagram(id, viewBox, markup) {
    const diagram = document.getElementById(id);
    diagram.setAttribute("viewBox", viewBox);
    diagram.innerHTML = markup;
  }

  function cabinet(x, y, scale = 1) {
    return `<g transform="translate(${x} ${y}) scale(${scale})">
      <rect x="-50" y="-55" width="100" height="110" rx="9" fill="#e3f1ff" stroke="#19315e" stroke-width="3"/>
      <rect x="-41" y="-46" width="82" height="91" rx="6" fill="#fff" stroke="#5892ba" stroke-width="2"/>
      <rect x="-30" y="-32" width="53" height="49" rx="6" fill="#d4edfd" stroke="#0968d6" stroke-width="2"/>
      <rect x="-19" y="-23" width="29" height="23" rx="3" fill="#19315e"/>
      <path d="M-20 7H14M-20 11H3M-29 34H23M29 -29V27" stroke="#2276b8" stroke-width="3" stroke-linecap="round"/>
      <circle cx="30" cy="-40" r="4.5" fill="#43cde7"/>
      <path d="M-12 55V64M12 55V64M26 -55V-70" stroke="#19315e" stroke-width="4" stroke-linecap="round"/>
    </g>`;
  }

  function external(kind, x, y) {
    if (kind === "ups") return `<g transform="translate(${x} ${y})">
      <rect x="-49" y="-31" width="98" height="62" rx="8" fill="#e3f1ff" stroke="#19315e" stroke-width="2.5"/>
      <rect x="-37" y="-19" width="59" height="36" rx="4" fill="#fff" stroke="#5f94bf" stroke-width="2"/>
      <path d="M-7 -14L-20 4H-8L-14 17L5 -4H-6Z" fill="#0968d6"/>
      <circle cx="34" cy="-9" r="4" fill="#28b2d5"/>
      <circle cx="34" cy="9" r="4" fill="#19315e"/>
    </g>`;
    if (kind === "modem") return `<g transform="translate(${x} ${y})">
      <rect x="-46" y="-23" width="92" height="52" rx="7" fill="#19315e"/>
      <rect x="-35" y="-13" width="70" height="28" rx="4" fill="#2b5a93"/>
      <path d="M-36 -23V-42M-29 -43H-43" stroke="#19315e" stroke-width="4" stroke-linecap="round"/>
      <path d="M-10 -3H24M-10 7H14" stroke="#9ad8f7" stroke-width="3" stroke-linecap="round"/>
      <circle cx="-24" cy="2" r="4" fill="#56dbef"/>
      <path d="M-28 30V37M-15 30V37M15 30V37M28 30V37" stroke="#4386bd" stroke-width="3"/>
    </g>`;
    return icon(kind, x, y);
  }

  function systemActor(kind, x, y, title, detail) {
    return `<g transform="translate(${x} ${y})">
      <circle r="86" class="diagram-disc"/>
      ${kind === "cabinet" ? cabinet(0, 0, 1.09) : icon(kind, 0, 0, 1.43)}
      ${text(0, 116, title)}
      ${text(0, 140, detail, "diagram-sub")}
    </g>`;
  }

  function architectureDiagram() {
    const marker = "flecha-sistema";
    if (compact.matches) {
      setDiagram("flujo-redes", "0 0 390 422", arrow(marker) + `<g transform="translate(0 -53)">
        ${wire("M63 126V170M63 260V293M63 361V402", marker)}
        ${icon("radar", 64, 102, .85)}
        ${cabinet(64, 216, .66)}
        ${icon("server", 64, 328, .89)}
        ${icon("monitor", 64, 434, .84)}
        ${text(159, 100, "Radar FM02B", "diagram-label align-start")}
        ${text(159, 123, "Lectura por RS-485", "diagram-sub align-start")}
        ${text(159, 214, "Estación", "diagram-label align-start")}
        ${text(159, 237, "Registro y envío por GPRS o WiFi", "diagram-sub align-start")}
        ${text(159, 326, "Servidor", "diagram-label align-start")}
        ${text(159, 349, "Fecha y distancia", "diagram-sub align-start")}
        ${text(159, 423, "Página", "diagram-label align-start")}
        ${text(159, 444, "Gráfico de crecida simulado", "diagram-sub align-start")}</g>
      `);
      return;
    }
    setDiagram("flujo-redes", "0 0 1220 304", arrow(marker) + `
      ${wire("M225 120H352", marker)}
      ${wire("M525 120H663", marker)}
      ${wire("M836 120H973", marker, "wire-alt", false)}
      ${text(290, 104, "RS-485", "diagram-link-label")}
      ${text(595, 104, "GPRS o WiFi", "diagram-link-label")}
      ${text(906, 104, "Visualización", "diagram-link-label")}
      ${systemActor("radar", 139, 120, "Radar FM02B", "Mide la distancia al agua")}
      ${systemActor("cabinet", 439, 120, "Estación", "Registra cada lectura")}
      ${systemActor("server", 750, 120, "Servidor", "Guarda fecha y distancia")}
      ${systemActor("monitor", 1060, 120, "Página de monitoreo", "Gráfico de crecida simulado")}
    `);
  }

  function pcbFrame(x, y, width, height) {
    const right = x + width;
    const bottom = y + height;
    const holes = [[x+15,y+15],[right-15,y+15],[x+15,bottom-15],[right-15,bottom-15]];
    return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="16" class="pcb-outline"/>
      <path d="M${x+28} ${y+42}H${x+46}V${y+31}H${x+68}
        M${right-29} ${bottom-43}H${right-49}V${bottom-30}H${right-64}
        M${x+31} ${bottom-22}H${x+54}V${bottom-38}H${x+71}
        M${right-31} ${y+22}H${right-53}V${y+34}H${right-68}" class="pcb-trace"/>
      ${holes.map(([cx,cy])=>`<circle cx="${cx}" cy="${cy}" r="5" class="pcb-hole"/>`).join("")}`;
  }

  function espModule(x, y) {
    return `<g transform="translate(${x} ${y})">
      <rect x="-32" y="-43" width="64" height="82" rx="7" fill="#2878ad" stroke="#19315e" stroke-width="2"/>
      <path d="M-22 -30H-14V-36H-6V-27H2V-36H10V-27H18V-34H24" fill="none" stroke="#9fe9fa" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
      <rect x="-20" y="-19" width="40" height="43" rx="5" fill="#d9edf4" stroke="#19315e" stroke-width="2"/>
      <path d="M-12 -7H11M-12 0H6M-12 7H4" stroke="#6b91ac" stroke-width="2" stroke-linecap="round"/>
      <path d="M-31 -15H-39M-31 -6H-39M-31 3H-39M-31 12H-39M-31 21H-39M31 -15H39M31 -6H39M31 3H39M31 12H39M31 21H39" stroke="#e2ad66" stroke-width="3" stroke-linecap="round"/>
      ${text(0, 57, "ESP32-S3", "board-label")}
    </g>`;
  }

  function rtcModule(x, y) {
    return `<g transform="translate(${x} ${y})">
      <rect x="-40" y="-25" width="80" height="50" rx="6" fill="#cce9fb" stroke="#468ab9" stroke-width="2"/>
      <rect x="-33" y="-10" width="28" height="20" rx="3" fill="#19315e"/>
      <path d="M-29 -14V-10M-23 -14V-10M-16 -14V-10M-10 -14V-10M-29 10V14M-23 10V14M-16 10V14M-10 10V14" stroke="#0968d6" stroke-width="2"/>
      <circle cx="18" cy="0" r="18" fill="#a2beca" stroke="#526782" stroke-width="2"/>
      <circle cx="18" cy="-1" r="13" fill="#edf7ff" stroke="#bdd4e4"/>
      <path d="M14 -1H22M18 -5V3" stroke="#526782" stroke-width="2" stroke-linecap="round"/>
      ${text(0, 43, "RTC DS3231M", "board-label")}
    </g>`;
  }

  function converter(x, y, channel, rs485Side, scale = 1) {
    return `<g transform="translate(${x} ${y}) scale(${scale})">
      <rect x="-48" y="-26" width="96" height="52" rx="7" fill="#cdeafa" stroke="#4386bd" stroke-width="2"/>
      <g transform="scale(${rs485Side === "left" ? -1 : 1} 1)">
      <rect x="-27" y="-10" width="37" height="20" rx="3" fill="#19315e"/>
      <path d="M-22 -15V-10M-13 -15V-10M-4 -15V-10M5 -15V-10M-22 10V15M-13 10V15M-4 10V15M5 10V15" stroke="#2876b0" stroke-width="2.4"/>
      <rect x="20" y="-13" width="21" height="26" rx="4" fill="#126d95"/>
      <circle cx="30" cy="-6" r="3.3" fill="#c3efff"/><circle cx="30" cy="6" r="3.3" fill="#c3efff"/>
      </g>
      ${text(0, 48, rs485Side === "left" ? "RS-485 ↔ TTL" : "TTL ↔ RS-485", "board-label")}
      ${text(0, 67, channel, "diagram-sub")}
    </g>`;
  }

  function sdModule(x,y) {
    return icon("sd",x,y,.72) + text(x,y+42,"microSD","board-label");
  }

  function stationDiagram() {
    const data = "flecha-estacion";
    const power = "flecha-alimentacion";
    const defs = arrow(data) + arrow(power, "#b56a22");
    const supply = path => wire(path, power, "power-wire", false);
    const trace = path => wire(path, data, "board-wire", false);
    const dataLink = path => wire(path, data, "", false);
    const protocol = (x, y, label) => text(x, y, label, "diagram-link-label");
    const voltage = (x, y, label) => text(x, y, label, "diagram-link-label power-label");
    if (compact.matches) {
      setDiagram("arquitectura-estacion", "0 0 420 642", defs + `
        ${supply("M161 573H9V41H39")}
        ${supply("M259 573H411V41H381")}
        ${supply("M210 542V489")}
        ${voltage(40, 542, "12 V")}
        ${voltage(380, 542, "12 V")}
        ${voltage(236, 519, "5 V")}
        ${external("radar", 81, 50)}
        ${external("modem", 334, 50)}
        ${text(88, 108, "Radar FM02B")}${text(325, 108, "Módem GPRS")}
        ${pcbFrame(35, 142, 350, 345)}
        ${text(210, 179, "PCB", "pcb-title")}
        ${dataLink("M42 62H23V246H52")}
        ${dataLink("M368 246H397V64H381")}
        ${protocol(64, 133, "RS-485")}${protocol(356, 133, "RS-485")}
        ${trace("M134 246H170")}
        ${trace("M249 246H286")}
        ${protocol(152, 235, "TTL")}${protocol(268, 235, "TTL")}
        ${trace("M172 265H149V353H116V371")}
        ${trace("M248 265H271V353H304V374")}
        ${protocol(128, 342, "I²C")}${protocol(290, 342, "SPI")}
        ${converter(93, 246, "UART 1 · Radar", "left", .85)}
        ${converter(327, 246, "UART 2 · Módem", "right", .85)}
        ${espModule(210, 246)}
        ${rtcModule(116, 397)}${sdModule(304, 397)}
        ${external("ups", 210, 572)}${text(210, 629, "Mini UPS")}
      `);
      return;
    }

    setDiagram("arquitectura-estacion", "0 0 1060 516", defs + `
      ${supply("M480 458H102V203")}
      ${supply("M580 458H958V205")}
      ${supply("M530 427V379")}
      ${voltage(280, 447, "12 V · Radar")}
      ${voltage(785, 447, "12 V · Módem")}
      ${voltage(558, 409, "5 V")}

      ${external("radar", 102, 168)}
      ${text(102, 112, "Radar FM02B")}
      ${external("modem", 958, 168)}
      ${text(958, 105, "Módem DTU GPRS")}
      ${external("ups", 530, 457)}
      ${text(530, 510, "Mini UPS")}

      ${pcbFrame(255, 17, 550, 361)}
      ${text(530, 58, "PCB", "pcb-title")}

      ${wire("M144 168H309", data)}
      ${wire("M751 168H906", data)}
      ${protocol(203, 151, "RS-485")}
      ${protocol(856, 151, "RS-485")}

      ${trace("M407 168H490")}
      ${trace("M570 168H653")}
      ${protocol(449, 151, "TTL")}${protocol(612, 151, "TTL")}
      ${trace("M490 191H474V263H417V282")}
      ${trace("M570 191H586V263H643V285")}
      ${protocol(433, 252, "I²C")}${protocol(626, 252, "SPI")}

      ${converter(359, 168, "UART 1 · Radar", "left")}
      ${espModule(530, 168)}
      ${converter(701, 168, "UART 2 · Módem", "right")}
      ${rtcModule(417, 309)}${sdModule(643, 309)}
    `);
  }

  function registerDiagram() {
    const marker = "flecha-registro";
    const route = (path, name) => wire(path, marker, "register-" + name, false)
      + `<path d="${path}" class="packet-line packet-${name}"/>`;
    setDiagram("flujo-registro", "0 0 560 112", arrow(marker) + `
      <rect x="18" y="7" width="286" height="94" rx="13" class="register-cabinet"/>
      ${text(161, 26, "Estación", "register-device-label")}
      ${route("M98 57H212", "save")}
      ${route("M304 57H458", "send")}
      ${text(154, 47, "Guardar", "diagram-link-label")}
      ${text(382, 42, "Enviar con internet", "diagram-link-label register-send-label")}
      ${icon("pcb", 68, 57, .64)}${icon("sd", 245, 56, .75)}${icon("server", 496, 55, .83)}
      ${text(246, 91, "microSD interna", "diagram-link-label")}
      ${text(496, 102, "Servidor")}
    `);
  }

  function outcomeDiagrams() {
    const continuity = "flecha-continuidad";
    setDiagram("resultado-continuidad", "0 0 550 183", arrow(continuity) + `
      <circle cx="74" cy="76" r="41" class="diagram-disc"/>
      ${wire("M115 76H175Q201 76 201 47V45H279", continuity)}
      ${wire("M115 76H175Q201 76 201 110V137H279", continuity)}
      ${icon("pcb", 74, 75, .75)}
      ${icon("monitor", 322, 45, .70)}
      ${icon("sd", 322, 137, .77)}
      ${text(74, 141, "215", "outcome-number")}
      ${text(74, 163, "medidas en banco", "diagram-sub")}
      ${text(375, 40, "213 en la web", "outcome-number align-start")}
      ${text(375, 63, "99,1 % de las lecturas", "diagram-sub align-start")}
      ${text(375, 133, "215 en microSD", "outcome-number align-start")}
      ${text(375, 156, "2 ausentes en la web", "diagram-sub align-start")}
    `);

    const recovery = "flecha-corte-internet";
    setDiagram("resultado-corte", "0 0 550 183", arrow(recovery) + `
      <circle cx="64" cy="65" r="40" class="diagram-disc"/>
      <circle cx="275" cy="65" r="40" class="diagram-disc"/>
      <circle cx="483" cy="65" r="40" class="diagram-disc"/>
      ${wire("M106 65H231", recovery)}
      ${wire("M317 65H439", recovery)}
      ${text(168, 48, "Guardar", "diagram-link-label")}
      ${text(378, 48, "Reenviar", "diagram-link-label")}
      <g transform="translate(64 65)" fill="none" stroke="#0968d6" stroke-width="3" stroke-linecap="round">
        <path d="M-21 -12a34 34 0 0 1 42 0M-14 -3a23 23 0 0 1 28 0M-7 7a12 12 0 0 1 14 0"/>
        <circle cx="0" cy="16" r="2.5" fill="#0968d6" stroke="none"/>
        <path d="M-21 -19 21 22" stroke="#f8fbff" stroke-width="8"/>
        <path d="M-21 -19 21 22" stroke="#a55224"/>
      </g>
      ${icon("sd", 275, 65, .81)}
      ${icon("server", 483, 64, .78)}
      ${text(74, 134, "Corte de internet", "outcome-step")}
      ${text(275, 134, "microSD", "outcome-step")}
      ${text(483, 134, "7 de 7", "outcome-number")}
      ${text(64, 157, "Sin conexión", "diagram-sub")}
      ${text(275, 157, "7 lecturas pendientes", "diagram-sub")}
      ${text(483, 157, "Cola vacía en 96 s", "diagram-sub")}
    `);
  }

  function deploymentDiagram() {
    setDiagram("estaciones-operativas", "0 0 182 81", `
      <circle cx="46" cy="31" r="27" class="diagram-disc"/>
      <circle cx="136" cy="31" r="27" class="diagram-disc"/>
      ${cabinet(46, 31, .39)}${cabinet(136, 31, .39)}
      ${text(46, 76, "SIL", "outcome-step")}
      ${text(136, 76, "MASI", "outcome-step")}
    `);
  }

  function layout() {
    architectureDiagram();
    stationDiagram();
  }
  compact.addEventListener("change", layout);
  layout();
  registerDiagram();
  outcomeDiagrams();
  deploymentDiagram();
})();







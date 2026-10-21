/* Control de Lavados — utilidades compartidas */
const TZ = "America/Bogota";
let _offset = 0; // diferencia entre la hora del servidor y la del dispositivo
const ahora = () => Date.now() + _offset;
const $ = s => document.querySelector(s);

async function api(accion, datos) {
  if (!API_URL || API_URL.indexOf("PEGA_AQUI") >= 0) throw new Error("Falta pegar la URL del script en config.js.");
  let r;
  try {
    r = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(Object.assign({ accion }, datos || {}))
    });
  } catch (e) { throw new Error("Sin conexión. Revisa el internet."); }
  let j;
  try { j = await r.json(); } catch (e) { throw new Error("El servidor no respondió bien. Intenta de nuevo."); }
  if (j.ahora) _offset = j.ahora - Date.now();
  if (!j.ok) throw new Error(j.error || "Error");
  return j;
}

function esc(s) { return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
function hhmm(ms) { return ms ? new Date(ms).toLocaleTimeString("es-CO", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: false }) : "—"; }
function hoyKey() { return new Date(ahora()).toLocaleDateString("en-CA", { timeZone: TZ }); }
function dur(sec) {
  if (sec == null || isNaN(sec)) return "—";
  sec = Math.max(0, Math.round(sec));
  const h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60, z = n => String(n).padStart(2, "0");
  return (h ? h + ":" + z(m) : m) + ":" + z(s);
}
function mins(sec) { return sec == null ? "—" : (sec / 60).toFixed(1) + " min"; }
function nivel(sec, meta) { const m = sec / 60; return m > meta ? "bad" : m > meta * 0.75 ? "warn" : "ok"; }
function textoNivel(lv) { return lv === "bad" ? "Fuera de meta" : lv === "warn" ? "Cerca de la meta" : "Dentro de la meta"; }

/* Recuadro del vehículo en lavado.
   modo: "boton" (Finalizar), "confirmar" (Sí terminó / Cancelar), "ninguno" (solo ver) */
function pintarActual(box, cur, pend, meta, modo, ocupado) {
  if (cur) {
    const sec = (ahora() - cur.inicio) / 1000, lv = nivel(sec, meta);
    let acciones = "";
    if (modo === "boton") acciones = `<button class="btn big" data-fin="${esc(cur.id)}" ${ocupado ? "disabled" : ""}>Finalizar lavado</button>`;
    if (modo === "confirmar") acciones = `<div class="inline-confirm"><span>¿Ya terminó el lavado?</span>
      <button class="btn big okb" data-finok="${esc(cur.id)}" ${ocupado ? "disabled" : ""}>Sí, terminó</button>
      <button class="btn ghost" data-cancelar="1">Cancelar</button></div>`;
    box.className = "now " + lv;
    box.innerHTML = `<h3>En lavado</h3><span class="plate">${esc(cur.placa)}</span>
      <div class="sub">${esc(cur.tipo)} · inició ${hhmm(cur.inicio)}</div>
      <div class="clock">${dur(sec)}</div>
      <span class="chip ${lv}">${textoNivel(lv)}</span>${acciones}`;
  } else {
    box.className = "now";
    box.innerHTML = pend.length
      ? `<h3>Sin vehículo en lavado</h3><p class="sub">Siguiente: <span class="plate">${esc(pend[0].placa)}</span></p>`
      : `<h3>Sin vehículos pendientes</h3><p class="sub">Cuando registren un vehículo aparecerá aquí.</p>`;
  }
}

function tickReloj(box, cur, meta) {
  if (!cur) return;
  const c = box.querySelector(".clock"); if (!c) return;
  const sec = (ahora() - cur.inicio) / 1000, lv = nivel(sec, meta);
  c.textContent = dur(sec);
  if (!box.classList.contains(lv)) {
    box.className = "now " + lv;
    const chip = box.querySelector(".chip"); if (chip) { chip.className = "chip " + lv; chip.textContent = textoNivel(lv); }
  }
}

function pintarCola(el, pend, cur, conBoton, ocupado) {
  if (!pend.length) { el.innerHTML = '<div class="empty panel">No hay vehículos en espera.</div>'; return; }
  el.innerHTML = pend.map((r, i) => `<div class="qitem ${i === 0 ? "first" : ""}">
    <div class="qnum">${i + 1}</div>
    <div class="qmeta"><span><span class="plate">${esc(r.placa)}</span> &nbsp;${esc(r.tipo)}</span>
      <small>${r.horaCliente ? "Cliente llega " + esc(r.horaCliente) + " · " : ""}registrado ${hhmm(r.registrado)}</small></div>
    ${conBoton && i === 0 ? `<button class="btn" data-ini="${esc(r.id)}" ${cur || ocupado ? "disabled" : ""}>Iniciar</button>` : ""}
  </div>`).join("");
}

let _lock = null;
async function mantenerPantalla() {
  try { if (!_lock && navigator.wakeLock) { _lock = await navigator.wakeLock.request("screen"); _lock.addEventListener("release", () => _lock = null); } } catch (e) {}
}

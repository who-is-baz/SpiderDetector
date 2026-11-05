// Spider-Society Anomaly Detector: cámara, decisión por grupo y envío de la letra al ESP32.
// Los grupos y personajes se configuran en personajes.js.

const BAUDIOS = 115200;
const LATIDO_MS = 2000;            // reenvío la letra por si el ESP32 se reinició solo
const ESPERA_ARRANQUE_MS = 2200;   // el ESP32 se reinicia al abrir el puerto, espero a que arranque
const REVISION_CAMARA_MS = 2000;
const CICLO_LENTO_MS = 3000;

const $ = id => document.getElementById(id);

// Serial
let puerto = null;
let escritor = null;
let letraActual = 'N';
let ultimaEnviada = 'N';

// Cámara y modelo
let modelo = null;
let camara = null;
let activo = false;
let ultimoCiclo = 0;

// Decisión
let grupoActual = 'neutral';
let personajeActual = null;
let grupoCandidato = null;
let rachaGrupo = 0;
let personajeCandidato = null;
let rachaPersonaje = 0;
const avisadas = new Set();   // para no repetir el mismo aviso en cada frame

// Vigilancia de la cámara
let tiempoVideo = -1;
let videoCongelado = false;
let cicloAvisado = false;

let glitchTimer = null;


// ---- Interfaz ----

function log(mensaje) {
  const hora = new Date().toLocaleTimeString();
  $('log').textContent = `[${hora}] ${mensaje}\n` + $('log').textContent;
}

function avisarUnaVez(clave, mensaje) {
  if (avisadas.has(clave)) return false;
  avisadas.add(clave);
  log(mensaje);
  return true;
}

function porcentaje(p) {
  return (p * 100).toFixed(0) + '%';
}

function animarEntrada() {
  const tarjeta = $('result');
  tarjeta.classList.remove('enter');
  void tarjeta.offsetWidth;   // forzar reflow para que la animación vuelva a empezar
  tarjeta.classList.add('enter');
}

function cancelarGlitch() {
  clearTimeout(glitchTimer);
  glitchTimer = null;
  $('result').classList.remove('glitching');
}

function terminarGlitch() {
  glitchTimer = null;
  $('result').classList.remove('glitching');
  animarEntrada();
}

function pintarGrupo(grupo) {
  const cfg = GRUPOS[grupo];
  const tarjeta = $('result');
  tarjeta.dataset.g = grupo;
  tarjeta.style.setProperty('--accent', `var(${cfg.color})`);
  $('rLetter').textContent = cfg.letra;
  $('rTitle').textContent = cfg.titulo;
  $('rStamp').textContent = cfg.sello;

  // al cambiar de grupo todavía no sé el personaje, muestro solo el grupo
  cancelarGlitch();
  if (grupo === 'neutral') {
    $('rSpider').textContent = 'SIN MINIFIG';
  } else {
    $('rSpider').textContent = cfg.titulo;
  }
  $('rSub').textContent = cfg.sub;
  animarEntrada();
}

function pintarPersonaje(clase) {
  const personaje = PERSONAJES[clase];
  $('rSpider').textContent = personaje.nombreSpider || clase;
  $('rSub').textContent = GRUPOS[personaje.grupo].sub;
  cancelarGlitch();

  if (personaje.glitch) {
    void $('result').offsetWidth;   // reflow por si ya estaba en glitch
    $('result').classList.add('glitching');
    glitchTimer = setTimeout(terminarGlitch, GLITCH_MS);
  } else {
    animarEntrada();
  }
}

function pintarBarras(prob, grupoTop) {
  for (const grupo of Object.keys(GRUPOS)) {
    const fila = document.querySelector(`.bar[data-g="${grupo}"]`);
    fila.querySelector('.fill').style.width = porcentaje(prob[grupo]);
    fila.querySelector('.pct').textContent = porcentaje(prob[grupo]);
    fila.classList.toggle('top', grupo === grupoTop);
  }
}

function pintarMasParecido(mejor, grupoTop) {
  const candidato = mejor[grupoTop];
  if (!candidato || grupoTop === 'neutral') {
    $('closest').textContent = '';
    return;
  }
  const nombre = PERSONAJES[candidato.clase].nombreSpider || candidato.clase;
  $('closest').textContent = `Más parecido a: ${nombre} (${porcentaje(candidato.p)})`;
}

function crearBarras() {
  let html = '';
  for (const [grupo, cfg] of Object.entries(GRUPOS)) {
    html += `<div class="bar" data-g="${grupo}" style="--c:var(${cfg.color})">` +
            `<span>${cfg.titulo}</span>` +
            '<div class="track"><div class="fill"></div></div>' +
            '<span class="pct">0%</span></div>';
  }
  $('bars').innerHTML = html;
}


// ---- Web Serial ----

async function conectar() {
  try {
    puerto = await navigator.serial.requestPort();
    await puerto.open({ baudRate: BAUDIOS });
    escritor = puerto.writable.getWriter();
    $('dot').classList.add('on');
    $('connText').textContent = 'ESP32 conectado';
    $('btnConnect').textContent = 'Desconectar';
    log('Puerto abierto. Esperando a que el ESP32 reinicie…');
    setTimeout(() => enviar(letraActual, true), ESPERA_ARRANQUE_MS);
    puerto.addEventListener('disconnect', () => cerrarPuerto('ESP32 desconectado (cable)'));
  } catch (e) {
    log('No se pudo conectar: ' + e.message);
    puerto = null;
  }
}

async function cerrarPuerto(mensaje) {
  // si el cable ya se quitó, releaseLock y close pueden fallar; no importa
  try {
    if (escritor) escritor.releaseLock();
  } catch (_) {}
  try {
    if (puerto) await puerto.close();
  } catch (_) {}

  escritor = null;
  puerto = null;
  $('dot').classList.remove('on');
  $('connText').textContent = 'ESP32 desconectado';
  $('btnConnect').textContent = 'Conectar ESP32';
  if (mensaje) log(mensaje);
}

// forzar: manda aunque sea la misma letra; silencioso: no la escribe en el registro
async function enviar(letra, forzar = false, silencioso = false) {
  letraActual = letra;
  if (!escritor) return;
  if (!forzar && letra === ultimaEnviada) return;
  try {
    ultimaEnviada = letra;
    await escritor.write(new TextEncoder().encode(letra));
    if (!silencioso) log('→ ESP32: ' + letra);
  } catch (e) {
    log('Error al enviar: ' + e.message);
  }
}

function alternarConexion() {
  if (puerto) {
    cerrarPuerto('Desconectado');
  } else {
    conectar();
  }
}

function latido() {
  if (escritor) enviar(letraActual, true, true);
}


// ---- Decisión ----

// Sumo las probabilidades de todas las clases de cada grupo: si el modelo confunde
// dos personajes del mismo grupo, el ESP32 no cambia de estado.
function sumarPorGrupo(predicciones) {
  const prob = {};    // grupo -> suma de probabilidades
  const mejor = {};   // grupo -> clase más probable dentro del grupo
  for (const grupo of Object.keys(GRUPOS)) prob[grupo] = 0;

  for (const pred of predicciones) {
    const cfg = PERSONAJES[pred.className];
    if (!cfg) {
      avisarUnaVez(pred.className, 'Aviso: clase sin configurar en personajes.js: ' + pred.className);
      continue;
    }
    prob[cfg.grupo] += pred.probability;
    if (!mejor[cfg.grupo] || pred.probability > mejor[cfg.grupo].p) {
      mejor[cfg.grupo] = { clase: pred.className, p: pred.probability };
    }
  }
  return { prob, mejor };
}

function grupoMasProbable(prob) {
  // empiezo en neutral; otro grupo solo lo reemplaza si es estrictamente mayor
  let grupoTop = 'neutral';
  for (const grupo of Object.keys(GRUPOS)) {
    if (prob[grupo] > prob[grupoTop]) grupoTop = grupo;
  }
  return grupoTop;
}

// Un grupo solo cuenta si pasa el umbral y además le gana a Neutral por el margen.
// Si no, el candidato es Neutral, así la tarjeta no se queda pegada con la plataforma vacía.
function elegirObjetivo(prob, grupoTop, umbral, margen) {
  if (grupoTop === 'neutral') return 'neutral';
  if (prob[grupoTop] < umbral) return 'neutral';
  if (prob[grupoTop] - prob.neutral < margen) return 'neutral';
  return grupoTop;
}

function actualizarRachas(objetivo, mejor) {
  if (objetivo === grupoCandidato) {
    rachaGrupo++;
  } else {
    grupoCandidato = objetivo;
    rachaGrupo = 1;
  }

  let clase = null;
  if (objetivo !== 'neutral' && mejor[objetivo]) clase = mejor[objetivo].clase;
  if (clase === personajeCandidato) {
    rachaPersonaje++;
  } else {
    personajeCandidato = clase;
    rachaPersonaje = 1;
  }
}

function procesar(predicciones) {
  const { prob, mejor } = sumarPorGrupo(predicciones);
  const grupoTop = grupoMasProbable(prob);
  pintarBarras(prob, grupoTop);
  pintarMasParecido(mejor, grupoTop);

  const umbral = Number($('thr').value) / 100;
  const framesNecesarios = Number($('stab').value);
  const margen = Number($('margin').value) / 100;

  const objetivo = elegirObjetivo(prob, grupoTop, umbral, margen);
  actualizarRachas(objetivo, mejor);

  // el grupo es lo que mueve el hardware
  if (rachaGrupo >= framesNecesarios && objetivo !== grupoActual) {
    grupoActual = objetivo;
    personajeActual = null;
    pintarGrupo(objetivo);
    enviar(GRUPOS[objetivo].letra);
  }

  // el personaje solo cambia el nombre en la tarjeta
  const personajeListo = personajeCandidato && rachaPersonaje >= framesNecesarios;
  if (grupoActual === objetivo && objetivo !== 'neutral' && personajeListo &&
      personajeCandidato !== personajeActual) {
    personajeActual = personajeCandidato;
    pintarPersonaje(personajeCandidato);
  }
}


// ---- Modelo y cámara ----

async function cargarModelo() {
  for (const base of [MODELO_LOCAL, MODELO_ONLINE]) {
    try {
      const m = await tmImage.load(base + 'model.json', base + 'metadata.json');
      if (base === MODELO_LOCAL) {
        log('Modelo cargado desde carpeta local');
      } else {
        log('Modelo cargado desde Teachable Machine (online)');
      }
      return m;
    } catch (e) {
      log('Falló ' + base + ' → ' + e.message);
    }
  }
  throw new Error('No se pudo cargar el modelo');
}

// mismo chequeo que check_modelo.js, para verlo sin abrir la terminal
function revisarClases() {
  const etiquetas = modelo.getClassLabels();
  const faltantes = Object.keys(PERSONAJES).filter(clase => {
    return !PERSONAJES[clase].respaldo && !etiquetas.includes(clase);
  });
  if (faltantes.length) {
    log(`Aviso: ${faltantes.length} personaje(s) de personajes.js no están en el modelo: ` +
        `${faltantes.join(', ')} (corre: node check_modelo.js)`);
  }
}

async function iniciar() {
  $('btnCam').disabled = true;
  $('camMsg').textContent = 'Cargando modelo…';
  try {
    modelo = await cargarModelo();
    revisarClases();

    $('camMsg').textContent = 'Abriendo cámara…';
    camara = new tmImage.Webcam(400, 400, false);
    await camara.setup();
    await camara.play();
    $('cam').innerHTML = '';
    $('cam').appendChild(camara.canvas);

    activo = true;
    ultimoCiclo = performance.now();
    $('btnCam').textContent = 'Cámara activa';
    vigilarCamara();
    requestAnimationFrame(ciclo);
  } catch (e) {
    $('camMsg').textContent = 'Error: ' + e.message;
    $('btnCam').disabled = false;
    log('Error: ' + e.message);
  }
}

// Atrapo cualquier error para que el ciclo siga: el canvas solo se actualiza aquí,
// y si el ciclo muere la imagen se queda congelada.
async function ciclo() {
  if (!activo) return;
  try {
    camara.update();
    procesar(await modelo.predict(camara.canvas));
    ultimoCiclo = performance.now();
  } catch (e) {
    if (avisarUnaVez('ciclo:' + e.message, 'Error en la detección (sigue intentando): ' + e.message)) {
      console.error(e);
    }
  }
  requestAnimationFrame(ciclo);
}


// ---- Vigilancia: deja en el registro por qué se congela la imagen ----

function escucharPista(video) {
  const pista = video.srcObject && video.srcObject.getVideoTracks()[0];
  if (!pista) return;
  pista.addEventListener('ended', () => log('Error: la cámara se desconectó. Revisa el cable USB y vuelve a cargar la página.'));
  pista.addEventListener('mute', () => log('Aviso: la cámara dejó de mandar imagen (posible caída de voltaje USB).'));
  pista.addEventListener('unmute', () => log('Cámara recuperada.'));
}

function escucharWebGL() {
  // si la GPU se reinicia, TF.js pierde el contexto WebGL y ya no predice
  try {
    const gl = tf.backend().gpgpu.gl;
    gl.canvas.addEventListener('webglcontextlost', () => {
      log('Error: se perdió el contexto WebGL (la GPU se reinició). Vuelve a cargar la página.');
    });
  } catch (_) {}
}

function revisarVideo() {
  const t = camara.webcam.currentTime;
  if (t === tiempoVideo && !videoCongelado) {
    videoCongelado = true;
    log('Aviso: la cámara no entrega frames nuevos desde hace 2 s. Si pasó justo al moverse el servo, es caída de voltaje USB.');
  } else if (t !== tiempoVideo && videoCongelado) {
    videoCongelado = false;
    log('Cámara recuperada.');
  }
  tiempoVideo = t;
}

function revisarCiclo() {
  const lento = performance.now() - ultimoCiclo > CICLO_LENTO_MS;
  if (lento && !cicloAvisado) {
    cicloAvisado = true;
    log('Aviso: el modelo no responde desde hace 3 s (predict colgado).');
  } else if (!lento && cicloAvisado) {
    cicloAvisado = false;
    log('Detección recuperada.');
  }
}

function vigilarCamara() {
  escucharPista(camara.webcam);
  escucharWebGL();
  setInterval(() => {
    // con la pestaña oculta el navegador pausa todo, no es una falla
    if (!activo || document.hidden) return;
    revisarVideo();
    revisarCiclo();
  }, REVISION_CAMARA_MS);
}


// ---- Arranque ----

if (!('serial' in navigator)) {
  const aviso = $('bannerSerial');
  aviso.textContent = 'Este navegador no soporta Web Serial. Abre esta página en Chrome o Edge para controlar el ESP32. La cámara y el modelo sí funcionan aquí.';
  aviso.classList.add('show');
  $('btnConnect').disabled = true;
}

$('btnConnect').onclick = alternarConexion;
$('btnCam').onclick = iniciar;
document.querySelectorAll('[data-send]').forEach(boton => {
  boton.onclick = () => enviar(boton.dataset.send, true);
});
setInterval(latido, LATIDO_MS);

$('thr').oninput = e => { $('thrV').textContent = e.target.value + '%'; };
$('stab').oninput = e => { $('stabV').textContent = e.target.value; };
$('margin').oninput = e => { $('marginV').textContent = e.target.value; };
$('margin').value = MARGEN_NEUTRAL;
$('marginV').textContent = MARGEN_NEUTRAL;

crearBarras();
pintarGrupo('neutral');

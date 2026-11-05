// Compara las clases del modelo (metadata.json) con las de personajes.js.
// Uso: node check_modelo.js [carpeta del modelo]. Sale con código 1 si hay errores.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const carpetaBase = __dirname;
const carpetaModelo = path.resolve(carpetaBase, process.argv[2] || 'model');
let errores = 0;

function marcarError(mensaje) {
  errores++;
  console.log('  ERROR  ' + mensaje);
}

function marcarOk(mensaje) {
  console.log('  OK     ' + mensaje);
}

function anotar(mensaje) {
  console.log('  -      ' + mensaje);
}

// personajes.js es un script del navegador, no un módulo; lo corro en un contexto aparte
function leerPersonajes() {
  const contexto = {};
  vm.createContext(contexto);
  const codigo = fs.readFileSync(path.join(carpetaBase, 'personajes.js'), 'utf8');
  vm.runInContext(codigo + ';this.PERSONAJES = PERSONAJES;', contexto);
  return contexto.PERSONAJES;
}

function leerMetadatos() {
  const archivo = path.join(carpetaModelo, 'metadata.json');
  try {
    return JSON.parse(fs.readFileSync(archivo, 'utf8'));
  } catch (e) {
    console.error(`ERROR  No se pudo leer ${archivo}: ${e.message}`);
    process.exit(1);
  }
}

const PERSONAJES = leerPersonajes();
const metadatos = leerMetadatos();
for (const archivo of ['model.json', 'weights.bin']) {
  if (!fs.existsSync(path.join(carpetaModelo, archivo))) {
    console.log(`AVISO  Falta ${archivo} en ${carpetaModelo}`);
  }
}

const clases = metadatos.labels || [];
const claves = Object.keys(PERSONAJES).filter(clave => !PERSONAJES[clave].respaldo);
const respaldo = Object.keys(PERSONAJES).filter(clave => PERSONAJES[clave].respaldo);

console.log(`Modelo: ${carpetaModelo}  (exportado ${metadatos.timeStamp || '?'})`);
console.log(`Clases del modelo (${clases.length}): ${clases.join(', ')}`);
console.log(`Personajes configurados (${claves.length}): ${claves.join(', ')}\n`);

const esModeloViejo = clases.length && clases.every(c => respaldo.includes(c) || c === 'Neutral');
if (esModeloViejo) {
  console.log(`AVISO  Este es el modelo VIEJO de ${clases.length} clases por grupo, no el de un personaje por clase.\n` +
              '       La página funciona con él (usa las clases de respaldo), pero no distingue personajes.\n');
}

console.log('1) Clases del modelo sin configurar en personajes.js');
const sinConfigurar = clases.filter(c => !PERSONAJES[c]);
if (sinConfigurar.length) {
  for (const c of sinConfigurar) {
    marcarError(`"${c}" no existe en PERSONAJES (revisa mayúsculas, espacios y guiones)`);
  }
} else {
  marcarOk('ninguna');
}

console.log('2) Personajes de personajes.js que no están en el modelo');
const sinModelo = claves.filter(clave => !clases.includes(clave));
if (sinModelo.length) {
  for (const clave of sinModelo) {
    marcarError(`"${clave}" no es una clase del modelo`);
  }
} else {
  marcarOk('ninguno');
}
const clasesRespaldo = clases.filter(c => respaldo.includes(c));
if (clasesRespaldo.length) {
  anotar(`el modelo usa clases de RESPALDO: ${clasesRespaldo.join(', ')}`);
}

console.log('3) Neutral');
if (clases.includes('Neutral')) {
  marcarOk('existe en el modelo');
} else {
  marcarError('el modelo no tiene clase "Neutral"');
}
if (PERSONAJES.Neutral && PERSONAJES.Neutral.grupo === 'neutral') {
  marcarOk("existe en PERSONAJES con grupo 'neutral'");
} else {
  marcarError("PERSONAJES.Neutral falta o no tiene grupo 'neutral'");
}

// los nombres pendientes no cuentan como error, solo se avisan
console.log('4) Nombres pendientes (solo avisos)');
let pendientes = 0;
for (const clave of claves) {
  const personaje = PERSONAJES[clave];
  if (personaje.grupo === 'neutral') continue;
  if (!personaje.nombreSpider || /por confirmar/i.test(personaje.nombreSpider)) {
    pendientes++;
    anotar(`${clave}: nombreSpider por confirmar`);
  }
}
if (!pendientes) marcarOk('nada pendiente');

if (errores) {
  console.log(`\nResultado: ${errores} error(es). Corrige personajes.js o renombra las clases en Teachable Machine.`);
  process.exit(1);
}
console.log('\nResultado: el modelo y personajes.js coinciden.');
process.exit(0);

// Configuración del detector: grupos, personajes y ajustes iniciales.
// Es el único archivo que hay que tocar al cambiar el modelo o agregar personajes.

const MODELO_LOCAL = 'model/';
const MODELO_ONLINE = 'https://teachablemachine.withgoogle.com/models/pLdPh1b15/';

// S = servo 30° + LED verde
// V = servo 90° + LED amarillo
// A = servo 150° + LED rojo + buzzer
// N = servo 90° y todo apagado
const GRUPOS = {
  society:  { letra: 'S', titulo: 'SOCIEDAD',    sello: 'SOCIEDAD', sub: 'Miembro de la Spider-Society', color: '--green' },
  desertor: { letra: 'V', titulo: 'DESERTOR',    sello: 'FUGITIVO', sub: 'Fugitivo de la Sociedad',      color: '--amber' },
  anomalia: { letra: 'A', titulo: 'ANOMALÍA',    sello: 'ALERTA',   sub: '¡Alerta! Anomalía detectada',  color: '--red'   },
  neutral:  { letra: 'N', titulo: 'SIN MINIFIG', sello: '',         sub: 'Esperando personaje…',         color: '--gray'  },
};

// La clave tiene que ser idéntica al nombre de la clase en Teachable Machine.
// glitch: true muestra el efecto de glitch antes de la tarjeta.
const PERSONAJES = {
  // Sociedad (S)
  Miguel_OHara:     { grupo: 'society',  nombreSpider: 'Spider-Man 2099' },
  Peter_Parker:     { grupo: 'society',  nombreSpider: 'Por confirmar' },   // minifig clásico rojo y azul
  Werewolf_Peter:   { grupo: 'society',  nombreSpider: 'Werewolf Spider-Man' },
  Margo_Kess:       { grupo: 'society',  nombreSpider: 'Spider-Byte' },
  Patrick_OHara:    { grupo: 'society',  nombreSpider: 'Web-Slinger' },
  Charlotte_Webber: { grupo: 'society',  nombreSpider: 'Sun-Spider' },

  // Desertores (V)
  Gwen_Stacy:       { grupo: 'desertor', nombreSpider: 'Spider-Gwen' },
  Spider_Punk:      { grupo: 'desertor', nombreSpider: 'Spider-Punk' },
  Peter_B_Parker:   { grupo: 'desertor', nombreSpider: 'Spider-Man (Peter B. Parker)' },   // minifig de bata rosa
  Pavitr_Prabhakar: { grupo: 'desertor', nombreSpider: 'Spider-Man India' },

  // Anomalía (A)
  Miles_Morales:    { grupo: 'anomalia', nombreSpider: 'Spider-Man',  glitch: true },
  The_Prowler:      { grupo: 'anomalia', nombreSpider: 'The Prowler', glitch: true },

  // Neutral (N): plataforma vacía
  Neutral:          { grupo: 'neutral' },

  // Clases del modelo viejo de 4 grupos, que es el que está hoy en model/.
  // Con él la tarjeta solo muestra el grupo; se pueden borrar al exportar el modelo por personaje.
  Society:    { respaldo: true, grupo: 'society',  nombreSpider: 'Spider-Society' },
  Desertores: { respaldo: true, grupo: 'desertor', nombreSpider: 'Desertor' },
  Anomalia:   { respaldo: true, grupo: 'anomalia', nombreSpider: 'Anomalía', glitch: true },
};

const MARGEN_NEUTRAL = 15;   // valor inicial del deslizador, en puntos de porcentaje
const GLITCH_MS = 1500;      // debe coincidir con la duración de las animaciones de glitch en el CSS

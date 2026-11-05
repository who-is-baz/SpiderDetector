# Spider-Society Anomaly Detector

> **Hosted model:** <https://teachablemachine.withgoogle.com/models/pLdPh1b15/>

A webcam watches a platform holding a Spider-Man minifigure. A Teachable Machine model running in the browser classifies it into a group, and the page sends a single letter over Web Serial (115200 baud) to an ESP32.
The ESP32 moves a servo and drives three LEDs and a buzzer according to the group.
Everything needed to rebuild it (hardware, firmware, web page and model) is in this repo.

<!-- ![Demo](docs/img/demo.gif) -->

## States

| Letter | Group | Servo | Outputs |
|--------|-------|-------|---------|
| `S` | Society (`Society`) | 30° | Green LED |
| `V` | Defectors (`Desertores`) | 90° | Yellow LED |
| `A` | Anomaly (`Anomalia`) | 150° | Red LED + buzzer |
| `N` | Neutral (empty platform) | 90° | All off |

## Pins (ESP32 DevKit V1)

| Part | Pin |
|------|-----|
| Servo signal | D27 |
| Red LED | D13 |
| Green LED | D26 |
| Yellow LED | D25 |
| Buzzer | D14 |

## Quick start

1. Build the circuit: [docs/WIRING.md](docs/WIRING.md) (parts in [docs/MATERIALS.md](docs/MATERIALS.md)).
2. Upload the firmware (close any serial monitor and browser tab using the port first):
   ```bash
   arduino-cli compile --fqbn esp32:esp32:esp32doit-devkit-v1 "firmware/Final"
   arduino-cli upload -p /dev/ttyUSB0 --fqbn esp32:esp32:esp32doit-devkit-v1 "firmware/Final"
   ```
3. Start the page from inside `web/`:
   ```bash
   cd web
   python3 -m http.server 8000
   ```
4. Open <http://localhost:8000> in Chrome, Edge or Brave. Click **Conectar ESP32** and pick the port.
5. Click **Iniciar camara**. The page loads the local model in `web/model/`; if that fails it falls back to the hosted model above. To use your own model, see [docs/TRAIN_MODEL.md](docs/TRAIN_MODEL.md).

## Documentation

- [Materials](docs/MATERIALS.md)
- [Wiring guide](docs/WIRING.md)
- [Train the model](docs/TRAIN_MODEL.md)
- [How it works](docs/HOW_IT_WORKS.md)
- [Changelog](CHANGELOG.md)
- [Versión en español](README.es.md)

## Repository structure

```
SpiderDetector/
├── README.md / README.es.md
├── CHANGELOG.md
├── LICENSE
├── web/                 page, decision logic, model and libs
│   ├── index.html  app.js  personajes.js  check_modelo.js
│   ├── lib/             tf.min.js, teachablemachine-image.min.js
│   └── model/           model.json, metadata.json, weights.bin
├── firmware/Final/      Final.ino (ESP32 sketch)
└── docs/                guides and images
```

## Trademarks

Lego and Spider-Man are trademarks of their respective owners. This is a non-profit educational project with no affiliation to them.

## License

[MIT](LICENSE) © 2026 Ricardo Sebastián Balderas González

---

## Español

> **Modelo hospedado:** <https://teachablemachine.withgoogle.com/models/pLdPh1b15/>

Una webcam mira una plataforma con una minifig de Spider-Man. Un modelo de Teachable Machine que corre en el navegador la clasifica en un grupo, y la página manda una sola letra por Web Serial (115200 baud) a un ESP32.
El ESP32 mueve un servo y maneja tres LEDs y un buzzer según el grupo.
Todo lo necesario para reconstruirlo (hardware, firmware, página y modelo) está en este repo.

<!-- ![Demo](docs/img/demo.gif) -->

### Estados

| Letra | Grupo | Servo | Salidas |
|-------|-------|-------|---------|
| `S` | Sociedad (`Society`) | 30° | LED verde |
| `V` | Desertores (`Desertores`) | 90° | LED amarillo |
| `A` | Anomalía (`Anomalia`) | 150° | LED rojo + buzzer |
| `N` | Neutral (plataforma vacía) | 90° | Todo apagado |

### Pines (ESP32 DevKit V1)

| Pieza | Pin |
|-------|-----|
| Señal del servo | D27 |
| LED rojo | D13 |
| LED verde | D26 |
| LED amarillo | D25 |
| Buzzer | D14 |

### Inicio rápido

1. Arma el circuito: [docs/WIRING.md](docs/WIRING.md) (piezas en [docs/MATERIALS.md](docs/MATERIALS.md)).
2. Sube el firmware (cierra antes cualquier monitor serial y la pestaña que use el puerto):
   ```bash
   arduino-cli compile --fqbn esp32:esp32:esp32doit-devkit-v1 "firmware/Final"
   arduino-cli upload -p /dev/ttyUSB0 --fqbn esp32:esp32:esp32doit-devkit-v1 "firmware/Final"
   ```
3. Levanta la página desde dentro de `web/`:
   ```bash
   cd web
   python3 -m http.server 8000
   ```
4. Abre <http://localhost:8000> en Chrome, Edge o Brave. Pulsa **Conectar ESP32** y elige el puerto.
5. Pulsa **Iniciar camara**. La página carga el modelo local de `web/model/`; si falla, usa el modelo hospedado de arriba. Para usar tu propio modelo, ver [docs/TRAIN_MODEL.md](docs/TRAIN_MODEL.md).

### Documentación

- [Materiales](docs/MATERIALS.md)
- [Guía de conexiones](docs/WIRING.md)
- [Entrenar el modelo](docs/TRAIN_MODEL.md)
- [Cómo funciona](docs/HOW_IT_WORKS.md)
- [Changelog](CHANGELOG.md)
- [English version](README.md)

### Estructura del repo

```
SpiderDetector/
├── README.md / README.es.md
├── CHANGELOG.md
├── LICENSE
├── web/                 página, lógica de decisión, modelo y librerías
│   ├── index.html  app.js  personajes.js  check_modelo.js
│   ├── lib/             tf.min.js, teachablemachine-image.min.js
│   └── model/           model.json, metadata.json, weights.bin
├── firmware/Final/      Final.ino (sketch del ESP32)
└── docs/                guías e imágenes
```

### Marcas

Lego y Spider-Man son marcas de sus respectivos dueños. Este es un proyecto educativo sin fines de lucro y sin afiliación con ellos.

### Licencia

[MIT](LICENSE) © 2026 Ricardo Sebastián Balderas González

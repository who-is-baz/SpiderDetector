# Materials / Lista de materiales

[← Back to README](../README.md) · [Wiring](WIRING.md) · [Train the model](TRAIN_MODEL.md) · [How it works](HOW_IT_WORKS.md)

## Hardware

| Qty | Item | Note |
|-----|------|------|
| 1 | ESP32 DevKit V1 (USB chip CP2102) | The sketch targets the board `esp32doit-devkit-v1` |
| 1 | Micro servo, SG90 type | Pin D27 |
| 1 | Red LED | Pin D13 |
| 1 | Green LED | Pin D26 |
| 1 | Yellow LED | Pin D25 |
| 3 | Resistors for the LEDs | Recommended: typical value 220 Ω to 330 Ω (not a measured value) |
| 1 | Buzzer | Pin D14 |
| 1 | Electrolytic capacitor 470 µF | Smooths the servo current spike, see [WIRING](WIRING.md) |
| 1 | Breadboard + male-to-male jumper wires | |
| 1 | USB **data** cable | Not a charge-only cable |
| 1 | USB webcam | |

## Computer

- Laptop with **Chrome, Edge or Brave** (they support Web Serial).
- **Python 3** (local web server).
- **Node.js** (only for `web/check_modelo.js`).

## Software

- Arduino IDE **or** `arduino-cli`, with the `esp32` board package installed.

## Optional

- A mock-up / platform for the minifigs.
- Lego Spider-Man minifigures (series 71050).

---

## Español

### Hardware

| Cant. | Artículo | Nota |
|-------|----------|------|
| 1 | ESP32 DevKit V1 (chip USB CP2102) | El sketch apunta a la placa `esp32doit-devkit-v1` |
| 1 | Micro servo tipo SG90 | Pin D27 |
| 1 | LED rojo | Pin D13 |
| 1 | LED verde | Pin D26 |
| 1 | LED amarillo | Pin D25 |
| 3 | Resistencias para los LEDs | Recomendado: valor típico de 220 Ω a 330 Ω (no es un dato medido) |
| 1 | Buzzer | Pin D14 |
| 1 | Condensador electrolítico 470 µF | Suaviza el pico de corriente del servo, ver [WIRING](WIRING.md) |
| 1 | Protoboard y jumpers macho-macho | |
| 1 | Cable USB de **datos** | No uno solo de carga |
| 1 | Webcam USB | |

### Computadora

- Laptop con **Chrome, Edge o Brave** (soportan Web Serial).
- **Python 3** (servidor local).
- **Node.js** (solo para `web/check_modelo.js`).

### Software

- Arduino IDE **o** `arduino-cli`, con el paquete de placas `esp32`.

### Opcional

- Maqueta o plataforma para las minifigs.
- Minifigs Lego Spider-Man (serie 71050).

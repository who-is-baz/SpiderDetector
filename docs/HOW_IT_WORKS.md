# How it works / Cómo funciona

[← Back to README](../README.md) · [Materials](MATERIALS.md) · [Wiring](WIRING.md) · [Train the model](TRAIN_MODEL.md)

## Architecture

```
 ┌────────┐  frames  ┌───────────────────────────── browser ─────────────────────────────┐
 │ Webcam ├─────────►│ Teachable Machine model (TF.js) ─► decision logic (app.js)        │
 └────────┘          │                                         │ one letter: S / V / A / N│
                     │                                         ▼                          │
                     │                                  Web Serial, 115200 baud           │
                     └─────────────────────────────────────────┬──────────────────────────┘
                                                               │ USB (CP2102)
                                                         ┌─────▼─────┐
                                                         │   ESP32   │ Final.ino
                                                         └─┬──┬──┬──┬┘
                                              servo (D27) ─┘  │  │  └─ buzzer (D14)
                                              LEDs D13 / D26 / D25 ┘
```

## Decision logic (`web/app.js`)

Every frame the model returns one probability per class. Then:

1. **Sum probabilities per group.** Each class belongs to a group in `personajes.js`. Summing means that if the model confuses two characters of the same group, the state does not change.
2. **Confidence threshold (80 %).** The top group only counts if its summed probability reaches the threshold.
3. **Margin against Neutral (15 points).** The group must also beat `Neutral` by this margin; otherwise the target is Neutral. This keeps the card from sticking when the platform is empty.
4. **Stable frames (6).** The same target must repeat for 6 consecutive frames before the state changes (also to go back to Neutral).

The three values are sliders in the page; their defaults are in `index.html` (80 and 6) and `MARGEN_NEUTRAL` in `personajes.js` (15).

## Serial protocol

- **A letter is sent only when the state changes.** There is no need to flood the port, and the ESP32 keeps its state until a new letter arrives.
- **2 s heartbeat:** the current letter is resent every 2 s, so an ESP32 that restarted on its own recovers its state.
- **2.2 s wait after opening the port:** opening the port resets the ESP32, so the page waits for it to boot before sending the current letter.

## Firmware decisions (`firmware/Final/Final.ino`)

- **`millis()` instead of `delay()`** for the buzzer, so the servo keeps moving while it beeps (the loop only uses a short `delay` as its tick).
- **Servo moves 1° every 15 ms** to avoid jerks and limit the current spike.
- **PWM at 50 Hz, pulses from 500 to 2500 µs** (0° to 180°), 16-bit resolution.
- Unknown bytes (like line breaks) are ignored; only `S`, `V`, `A`, `N` are accepted.

## Español

### Arquitectura

Webcam → modelo de Teachable Machine (TF.js, en el navegador) → lógica de decisión (`app.js`) → una letra (S / V / A / N) por Web Serial a 115200 baud → ESP32 (`Final.ino`) → servo (D27), LEDs (D13 / D26 / D25) y buzzer (D14). Ver el diagrama arriba.

### Lógica de decisión (`web/app.js`)

En cada frame el modelo devuelve una probabilidad por clase. Después:

1. **Sumar probabilidades por grupo.** Cada clase pertenece a un grupo en `personajes.js`. Si el modelo confunde dos personajes del mismo grupo, el estado no cambia.
2. **Umbral de confianza (80 %).** El grupo con más probabilidad solo cuenta si su suma llega al umbral.
3. **Margen contra Neutral (15 puntos).** El grupo también debe ganarle a `Neutral` por ese margen; si no, el objetivo es Neutral. Así la tarjeta no se queda pegada con la plataforma vacía.
4. **Frames estables (6).** El mismo objetivo debe repetirse 6 frames seguidos para cambiar de estado (también para volver a Neutral).

Los tres valores son deslizadores en la página; sus valores iniciales están en `index.html` (80 y 6) y `MARGEN_NEUTRAL` en `personajes.js` (15).

### Protocolo serial

- **La letra se manda solo al cambiar de estado:** no hace falta saturar el puerto y el ESP32 conserva su estado hasta recibir otra letra.
- **Latido de 2 s:** se reenvía la letra actual cada 2 s, para que un ESP32 que se reinició solo recupere su estado.
- **Espera de 2.2 s al abrir el puerto:** abrir el puerto reinicia el ESP32; la página espera a que arranque antes de mandar la letra.

### Decisiones del firmware (`firmware/Final/Final.ino`)

- **`millis()` en vez de `delay()`** para el buzzer, así el servo sigue moviéndose mientras suena (el loop solo usa un `delay` corto como tick).
- **El servo avanza 1° cada 15 ms** para evitar tirones y limitar el pico de corriente.
- **PWM a 50 Hz con pulsos de 500 a 2500 µs** (0° a 180°), resolución de 16 bits.
- Los bytes desconocidos (como saltos de línea) se ignoran; solo se aceptan `S`, `V`, `A`, `N`.

# Wiring guide / Guía de conexiones

[← Back to README](../README.md) · [Materials](MATERIALS.md) · [Train the model](TRAIN_MODEL.md) · [How it works](HOW_IT_WORKS.md)

## Pin map

| Part | ESP32 pin | Notes |
|------|-----------|-------|
| Servo signal | D27 | PWM 50 Hz |
| Red LED | D13 | Anomaly |
| Green LED | D26 | Society |
| Yellow LED | D25 | Defectors |
| Buzzer | D14 | Anomaly (beeps) |

All LEDs and the buzzer share the ESP32 **GND**. Each LED goes through its own resistor (recommended 220–330 Ω).

## Breadboard rule

- Each numbered row is **split in two halves: a–e and f–j, with NO connection between them**. Two parts only share a node if they are in the same half of the same row.
- The **+ and − rails are continuous strips**: any hole of the rail works.

## Circuit (ASCII)

```
 ESP32                                   (one branch per LED, same idea x3)
 ┌────────┐
 │    D13 ├──[R 220-330Ω]──►|── GND rail (−)     red LED    (anode toward the pin)
 │    D26 ├──[R 220-330Ω]──►|── GND rail (−)     green LED
 │    D25 ├──[R 220-330Ω]──►|── GND rail (−)     yellow LED
 │    D14 ├──── buzzer (+) ; buzzer (−) ── GND rail (−)
 │    D27 ├──── servo signal
 │    GND ├──── GND rail (−) ─── servo ground (brown wire)
 │        │
 └────────┘     servo power (+): TODO: confirmar (see below)

   (+) rail ──────────┤├────────── (−) rail      470 µF electrolytic
                      cap    stripe (−) toward the − rail
```

## Capacitor

The **470 µF** electrolytic capacitor goes **between the + and − rails** (long leg to +, striped leg to −). It absorbs the current spike when the servo starts moving. Without it the voltage sags, which can **reset the ESP32 or freeze the USB camera**.

## My original layout (reference only, not the only possible one)

Rows/columns are breadboard coordinates (row number + half-row letter).

| Part | Position |
|------|----------|
| Red LED | legs at f10 and f12; resistor h10–h15; D13 wire at f15 |
| Green LED | legs at f18 and f20; resistor h18–h23; D26 wire at f23 |
| Servo | brown wire at c12; signal wire at c28 going to D27 at a28 |
| Buzzer | j26 and j29; D14 at f26; GND at f29 |
| Yellow LED | legs at f2 and f4; ground wire from g4 to the − rail; resistor h2–h7; D25 at f7 |
| Capacitor | between the + and − rails |

- TODO: confirmar — where the ESP32 sits on the breadboard.
- TODO: confirmar — where the servo power (red/+) wire comes from (ESP32 5V/VIN pin, USB, or external supply).
- TODO: confirmar — what the brown servo wire at c12 connects to on that row (presumed ground).

## Common problems

- **Yellow LED does not light:** the ground wire is in the wrong half of the row (a–e vs f–j). Move it to the same half as the LED leg.
- **Camera freezes when the servo moves:** voltage drop. Check the 470 µF capacitor and use a good USB data cable / port. The page logs "the camera stopped sending frames".
- **ESP32 resets when the serial port opens:** normal. Opening the port toggles the reset lines; the page waits 2.2 s and then resends the current letter.
- **Port busy when uploading the sketch:** close the browser tab (or press Disconnect) and any serial monitor first. Check who holds it with `fuser -v /dev/ttyUSB0`.

---

## Español

## Tabla de pines

| Pieza | Pin del ESP32 | Notas |
|-------|---------------|-------|
| Señal del servo | D27 | PWM 50 Hz |
| LED rojo | D13 | Anomalía |
| LED verde | D26 | Sociedad |
| LED amarillo | D25 | Desertores |
| Buzzer | D14 | Anomalía (pitidos) |

Todos los LEDs y el buzzer comparten la tierra (**GND**) del ESP32. Cada LED lleva su propia resistencia (recomendado 220–330 Ω).

## Regla de la protoboard

- Cada fila numerada está **partida en dos mitades: a–e y f–j, SIN conexión entre ellas**. Dos piezas solo comparten nodo si están en la misma mitad de la misma fila.
- Los rieles **+ y − son tiras continuas**: cualquier hoyo del riel sirve.

## Circuito

Mismo esquema ASCII de la sección en inglés (arriba): cada LED va de su pin, por su resistencia, al riel −; el buzzer entre D14 y el riel −; el servo con señal a D27 y tierra al riel −.

## Condensador

El condensador electrolítico de **470 µF** va **entre los rieles + y −** (pata larga a +, pata con franja a −). Absorbe el pico de corriente cuando el servo arranca. Sin él el voltaje cae y puede **reiniciar el ESP32 o congelar la cámara USB**.

## Layout de mi montaje original (solo referencia, no el único posible)

| Pieza | Posición |
|-------|----------|
| LED rojo | patas en f10 y f12; resistencia h10–h15; D13 en f15 |
| LED verde | patas en f18 y f20; resistencia h18–h23; D26 en f23 |
| Servo | cable café en c12; señal en c28 hacia D27 en a28 |
| Buzzer | j26 y j29; D14 en f26; GND en f29 |
| LED amarillo | patas en f2 y f4; cable de tierra de g4 al riel −; resistencia h2–h7; D25 en f7 |
| Condensador | entre los rieles + y − |

- TODO: confirmar — dónde va el ESP32 en la protoboard.
- TODO: confirmar — de dónde sale la alimentación (+) del servo (pin 5V/VIN del ESP32, USB o fuente externa).
- TODO: confirmar — a qué se conecta el cable café del servo en la fila 12 (se presume tierra).

## Problemas comunes

- **El LED amarillo no prende:** el cable de tierra está en la mitad equivocada de la fila (a–e vs f–j). Muévelo a la misma mitad que la pata del LED.
- **La cámara se congela al mover el servo:** caída de voltaje. Revisa el condensador de 470 µF y usa un buen cable/puerto USB de datos. La página avisa en el registro que la cámara dejó de mandar frames.
- **El ESP32 se reinicia al abrir el puerto serial:** es normal. Abrir el puerto activa las líneas de reset; la página espera 2.2 s y reenvía la letra actual.
- **El puerto queda ocupado al subir el sketch:** cierra la pestaña (o pulsa Desconectar) y cualquier monitor serial. Revisa quién lo usa con `fuser -v /dev/ttyUSB0`.

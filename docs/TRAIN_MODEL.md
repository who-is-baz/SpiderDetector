# Train the model / Entrenar el modelo

[← Back to README](../README.md) · [Materials](MATERIALS.md) · [Wiring](WIRING.md) · [How it works](HOW_IT_WORKS.md)

This project's hosted model: <https://teachablemachine.withgoogle.com/models/pLdPh1b15/>

## Steps

1. Go to <https://teachablemachine.withgoogle.com/> → **New Project → Image Project → Standard image model**.
2. Create **4 classes** with these EXACT names (case-sensitive): `Anomalia`, `Desertores`, `Society`, `Neutral`.

   | Class | Letter sent | Group | What goes in it |
   |-------|-------------|-------|-----------------|
   | `Society` | S | Spider-Society members | Minifigs that belong to the Society |
   | `Desertores` | V | Defectors | Minifigs that left the Society |
   | `Anomalia` | A | Anomalies | Anomaly minifigs |
   | `Neutral` | N | Nothing | The **empty platform** (also hands and background), so the model can say "nothing here" |

   Which minifig belongs to which group is your decision; the character roster used by the page is in `web/personajes.js`.
3. **Capture tips:**
   - Same conditions as the final setup: same camera, angle, light and background.
   - Vary the position and rotation of the minifigs.
   - Use a similar number of images per class.
   - Keep the Teachable Machine tab **visible** while capturing and training; in the background the browser pauses it and the progress bars freeze.
4. **Train** with the default settings and test in the preview panel.
5. **Export:** Export Model → **TensorFlow.js** → Download → unzip into `web/model/` (`model.json`, `metadata.json`, `weights.bin`).
6. Put the hosted link in `MODELO_ONLINE` in `web/personajes.js` (the page falls back to it if the local model fails to load).
7. Run, inside `web/`:
   ```bash
   node check_modelo.js
   ```
   It compares the classes in `model/metadata.json` with the keys in `personajes.js`:
   - `ERROR ... no existe en PERSONAJES`: the class has no entry in `personajes.js` (check capitals, spaces, accents).
   - `ERROR ... no es una clase del modelo`: `personajes.js` lists a character the model does not have.
   - `AVISO ... modelo VIEJO`: the model only has the group classes (like this project's 4-class model), so the page shows only the group, not the character.
   - Ends with `el modelo y personajes.js coinciden` and exit code 0 when everything matches; exit code 1 otherwise.
8. **Adding individual characters** (one class per character): create the class in Teachable Machine (no spaces or accents, use `_`, e.g. `Spider_Ham`), re-export the model, and add a line in `PERSONAJES` in `web/personajes.js`:
   ```js
   Spider_Ham: { grupo: 'society', nombreSpider: 'Spider-Ham' },
   ```
   The key must be identical to the class name. The `grupo` (`society`, `desertor`, `anomalia`, `neutral`) decides what the ESP32 does. Then run `node check_modelo.js` again and reload the page.

---

## Español

Modelo hospedado de este proyecto: <https://teachablemachine.withgoogle.com/models/pLdPh1b15/>

## Pasos

1. Entra a <https://teachablemachine.withgoogle.com/> → **Nuevo proyecto → Proyecto de imágenes → Modelo de imágenes estándar**.
2. Crea **4 clases** con estos nombres EXACTOS (distinguen mayúsculas): `Anomalia`, `Desertores`, `Society`, `Neutral`.

   | Clase | Letra | Grupo | Qué va en ella |
   |-------|-------|-------|----------------|
   | `Society` | S | Miembros de la Spider-Society | Minifigs de la Sociedad |
   | `Desertores` | V | Desertores | Minifigs que dejaron la Sociedad |
   | `Anomalia` | A | Anomalías | Minifigs de anomalía |
   | `Neutral` | N | Nada | La **plataforma vacía** (y manos o fondo), para que el modelo pueda decir "no hay nada" |

   Qué minifig va en cada grupo lo decides tú; el roster que usa la página está en `web/personajes.js`.
3. **Consejos de captura:**
   - Mismas condiciones que el montaje final: misma cámara, ángulo, luz y fondo.
   - Varía posición y rotación de las minifigs.
   - Cantidad de imágenes similar por clase.
   - Mantén la pestaña de Teachable Machine **visible** mientras capturas y entrenas; en segundo plano el navegador la pausa y las barras se quedan fijas.
4. **Entrena** con los ajustes por defecto y prueba en el panel de vista previa.
5. **Exporta:** Export Model → **TensorFlow.js** → Download → descomprime en `web/model/` (`model.json`, `metadata.json`, `weights.bin`).
6. Pon el link hospedado en `MODELO_ONLINE` de `web/personajes.js` (la página lo usa si falla el modelo local).
7. Corre, dentro de `web/`:
   ```bash
   node check_modelo.js
   ```
   Compara las clases de `model/metadata.json` con las claves de `personajes.js`:
   - `ERROR ... no existe en PERSONAJES`: la clase no tiene entrada en `personajes.js` (revisa mayúsculas, espacios, acentos).
   - `ERROR ... no es una clase del modelo`: `personajes.js` lista un personaje que el modelo no tiene.
   - `AVISO ... modelo VIEJO`: el modelo solo tiene clases por grupo (como el de 4 clases de este proyecto), así que la página muestra el grupo y no el personaje.
   - Termina con `el modelo y personajes.js coinciden` y código 0 si todo coincide; código 1 si no.
8. **Agregar personajes individuales** (una clase por personaje): crea la clase en Teachable Machine (sin espacios ni acentos, usa `_`, ej. `Spider_Ham`), vuelve a exportar el modelo y agrega una línea en `PERSONAJES` de `web/personajes.js`:
   ```js
   Spider_Ham: { grupo: 'society', nombreSpider: 'Spider-Ham' },
   ```
   La clave debe ser idéntica al nombre de la clase. El `grupo` (`society`, `desertor`, `anomalia`, `neutral`) decide lo que hace el ESP32. Corre otra vez `node check_modelo.js` y recarga la página.

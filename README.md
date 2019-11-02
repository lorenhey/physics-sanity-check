# physics-sanity-check

> El cálculo terminó y produjo un número. ¿Ese número tiene sentido físico?

`physics-sanity-check` detecta resultados físicamente sospechosos que pueden pasar una validación matemática y dimensional convencional.

Un resultado puede ser dimensionalmente correcto, numéricamente estable y, sin embargo, físicamente absurdo. Esta herramienta actúa como una capa por encima de las unidades y los tipos, razonando sobre escalas físicas, regímenes, condiciones de aplicabilidad y leyes de conservación, mediante un motor estructurado de plausibilidad física.

## Visión del Proyecto

El principio rector es: **"Dimensionalmente correcto" no significa "físicamente razonable".**

Ejemplos que esta herramienta busca detectar (o ayudar a detectar en sistemas acoplados):
- Una eficiencia de 138%.
- Una presión absoluta negativa (e.g. -15 kPa (a)).
- Un Mach de 0.8 en un modelo etiquetado como `incompressible`.
- Una velocidad orbital para la Tierra de 11.2 m/s (sugiriendo un clásico error de km/s confundido con m/s).

## Características

- **Contexto Físico:** Las reglas se evalúan según un `domain`, `system`, `model`, y `assumptions`.
- **Order of Magnitude Checks:** Compara los resultados con una biblioteca curada de escalas de referencia.
- **Regime Checks:** Valida suposiciones como "incompresible" evaluando el número de Mach resultante.
- **Metamorphic Testing (Probing):** `psc probe` genera perturbaciones físicas válidas (como un unit roundtrip) y comprueba si el modelo es invariante a cambios que deberían ser equivalentes, lo cual es excelente para detectar bugs de constantes "hardcodeadas" o mal uso de unidades.
- **Common-Error Signatures:** Los "warnings" explican qué se detectó, contra qué regla, y sugieren posibles causas. La regla compara el resultado con la escala esperada para el contexto seleccionado.
- **Sin falsos umbrales globales:** Todo umbral es configurable. Una diferencia de 100x puede ser normal en cosmología y un absurdo en ingeniería civil.

## Instalación

Instala el proyecto con `uv`:

```bash
uv tool install .
# o
uv sync
```

## Uso Rápido (CLI)

### Sanity Check de un caso

Un caso se define en YAML:

```yaml
context:
  domain: astrophysics
  system: earth
  model: newtonian

quantities:
  earth_escape_velocity:
    value: 11.2
    unit: m/s
    phys_type: generic
```

Ejecutar:

```bash
psc check case.yaml
```

Salida esperada:
```
+---------------------- WARNING - OOM-CHECK-001 ----------------------+
| Value for earth_escape_velocity (11.2 m/s) is ~10^-3 times the      |
| reference scale for earth (11186.0 m/s).                            |
|                                                                     |
| Possible causes:                                                    |
| - Wrong units (e.g. m/s vs km/s or mm vs m)                         |
| - Factor of 1000 error                                              |
| - Model assumptions heavily violated                                |
+---------------------------------------------------------------------+
```

### Metamorphic Probing

Comprueba si tu función de simulación sobrevive a un unit-roundtrip (ej. cambiar los inputs de masa de `kg` a `g` conservando su significado físico):

```bash
psc probe my_model.py calculate_trajectory my_case.yaml
```

## Reglas (Rule Packs)

- **Common:** Límites de eficiencia (0 a 1), positividad de temperatura absoluta.
- **Order of Magnitude (OOM):** Escalas curadas (por ej. `earth_radius`, `walking_speed`, `room_temperature`).
- **Fluids (Fluid Mechanics):** Restricciones de presión absoluta, límites de Mach para incompresibilidad.
- *Más reglas en desarrollo (Thermodynamics, Mechanics, Electromagnetism, etc.)*

## Licencia

MIT.

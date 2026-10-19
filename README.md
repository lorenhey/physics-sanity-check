# physics-sanity-check

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live%20Inspector-brightgreen?style=flat-square&logo=github)](https://lorenhey.github.io/physics-sanity-check/)
[![Version](https://img.shields.io/badge/version-2.1.0-blue?style=flat-square)](https://github.com/lorenhey/physics-sanity-check)
[![Python](https://img.shields.io/badge/python->=3.12-blue?style=flat-square&logo=python)](https://www.python.org/)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)

> *El cálculo terminó y produjo un número. ¿Ese número tiene sentido físico?*  
> **"Dimensionalmente correcto" no significa "físicamente razonable".**

`physics-sanity-check` detecta resultados físicamente sospechosos o absurdos que superan sin problemas una validación matemática y dimensional convencional.

Probá el auditor interactivo en tu navegador:  
👉 **[https://lorenhey.github.io/physics-sanity-check/](https://lorenhey.github.io/physics-sanity-check/)**

---

## 🎯 Visión y Problemática

Un cálculo puede ser dimensionalmente impecable, numéricamente estable y, sin embargo, describir un absurdo físico:
- Una eficiencia de máquina del $138\%$ ($\eta > 1$).
- Una presión absoluta negativa (ej. $-25 \text{ kPa}$ absolutos por confundir vacío manométrico).
- Un número de Mach de $0.82$ evaluado bajo un modelo etiquetado como `incompressible` ($Ma > 0.3$).
- Una velocidad de escape de la Tierra calculada en $11.2 \text{ m/s}$ (el clásico error de factor $1000$ al confundir $\text{km/s}$ con $\text{m/s}$).
- Un perno de acero con una tensión de tracción de $450 \text{ GPa}$ (superando la resistencia cohesiva teórica de los enlaces atómicos de Griffith).

`physics-sanity-check` actúa como un auditor semántico de plausibilidad física, razonando sobre escalas naturales, regímenes, condiciones de aplicabilidad y leyes de conservación.

---

## ⚡ Características Principales

- **Auditor Web Interactivo (Zero-Backend)**: Suite SPA para navegador en HTML5, CSS3, JavaScript y KaTeX.
- **Motor de Reglas de Plausibilidad Extensible**:
  - *Límites Absolutos*: Eficiencia ($0 \le \eta \le 1$), temperatura absoluta ($T \ge 0 \text{ K}$), presión absoluta ($p_{abs} \ge 0 \text{ Pa}$), velocidad relativista ($v < c$).
  - *Límites de Régimen*: Hipótesis incompresible ($Ma \le 0.3$), velocidades en tuberías industriales (riesgo de erosión, golpe de ariete o sedimentación).
  - *Límites de Material*: Tensiones máximas admisibles frente al límite teórico de Griffith ($\sim E/10$).
- **Chequeo de Órdenes de Magnitud ($OOM$)**: Comparación logarítmica $\log_{10}(Q / Q_{ref})$ contra una biblioteca curada de escalas de la naturaleza con diagnóstico de causas probables (factores $10^3$, prefijos métricos, etc.).
- **Visualizador en Escala Logarítmica**: Gráfico interactivo que sitúa el resultado del usuario en relación con las escalas del universo y de la ingeniería de planta.
- **Metamorphic Probing Lab**: Aplica perturbaciones unitarias a las funciones de cálculo (ej. $\text{m} \rightarrow \text{mm}$) y verifica si la salida conserva su invariancia física, detectando constantes con unidades implícitas hardcodeadas.
- **Terminal Web CLI**: Emulador interactivo para ejecutar comandos nativos de `psc` en el navegador.

---

## 🚀 Instalación Local

Gestionado con [`uv`](https://docs.astral.sh/uv/):

```bash
# Clonar repositorio
git clone https://github.com/lorenhey/physics-sanity-check.git
cd physics-sanity-check

# Sincronizar dependencias
uv sync
```

---

## 💻 Uso de la Línea de Comandos (CLI)

### 1. Auditar un Caso YAML
```bash
uv run psc check examples/case1.yaml
```

Salida:
```text
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

### 2. Metamorphic Probing de Modelos
```bash
uv run psc probe examples/model.py fake_gravity_model examples/case1.yaml
```

---

## 🧪 Tests y Validación

```bash
uv run pytest
```

---

## 📜 Licencia

Distribuido bajo la Licencia MIT. Consulta `LICENSE` para más detalles.

Desarrollado con rigor ingenieril por **Loren Hey** (2026).

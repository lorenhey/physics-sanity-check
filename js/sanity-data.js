/**
 * physics-sanity-check - Base de datos de escalas de referencia,
 * reglas de plausibilidad física y casos de estudio de ingeniería.
 * Loren Hey - Antigravity
 */

const REFERENCE_SCALES = {
    astrophysics: {
        name: "Astrofísica y Mecánica Celeste",
        scales: {
            earth_radius: { value: 6371000, unit: "m", desc: "Radio medio de la Tierra", source: "NASA" },
            earth_mass: { value: 5.972e24, unit: "kg", desc: "Masa de la Tierra", source: "NASA" },
            earth_escape_velocity: { value: 11186, unit: "m/s", desc: "Velocidad de escape superficial de la Tierra", source: "NASA" },
            earth_orbital_velocity: { value: 29780, unit: "m/s", desc: "Velocidad orbital media de la Tierra alrededor del Sol", source: "NASA" },
            sun_mass: { value: 1.989e30, unit: "kg", desc: "Masa del Sol", source: "IAU" },
            speed_of_light: { value: 299792458, unit: "m/s", desc: "Velocidad de la luz en el vacío (constante c)", source: "CODATA" }
        }
    },
    human: {
        name: "Escala Humana y Biomecánica",
        scales: {
            walking_speed: { value: 1.4, unit: "m/s", desc: "Velocidad media de marcha humana (~5 km/h)", source: "Biomecánica" },
            running_speed: { value: 6.0, unit: "m/s", desc: "Velocidad media de carrera humana (~21 km/h)", source: "Biomecánica" },
            human_mass: { value: 75.0, unit: "kg", desc: "Masa media corporal humana adulta", source: "OMS" },
            human_height: { value: 1.75, unit: "m", desc: "Estatura media humana adulta", source: "OMS" },
            room_temperature: { value: 293.15, unit: "K", desc: "Temperatura ambiente de confort (20 °C)", valid_range: [288, 298], source: "ISO 7730" },
            body_temperature: { value: 310.15, unit: "K", desc: "Temperatura corporal interna (37 °C)", valid_range: [308, 313], source: "Fisiología" }
        }
    },
    fluids: {
        name: "Mecánica de Fluidos e Hidráulica Industrial",
        scales: {
            water_density: { value: 1000.0, unit: "kg/m^3", desc: "Densidad del agua líquida a 4 °C y 1 atm", source: "NIST" },
            air_density: { value: 1.204, unit: "kg/m^3", desc: "Densidad del aire a 20 °C y 101.3 kPa", source: "NIST" },
            atmospheric_pressure: { value: 101325.0, unit: "Pa", desc: "Presión atmosférica estándar a nivel del mar (1 atm)", source: "ISO 2533" },
            sound_speed_air: { value: 343.2, unit: "m/s", desc: "Velocidad del sonido en aire seco a 20 °C", source: "ISO 9613" },
            sound_speed_water: { value: 1482.0, unit: "m/s", desc: "Velocidad del sonido en agua dulce a 20 °C", source: "NIST" },
            water_viscosity: { value: 0.001002, unit: "Pa*s", desc: "Viscosidad dinámica del agua a 20 °C (~1 cP)", source: "NIST" },
            pipe_water_velocity: { value: 2.0, unit: "m/s", desc: "Velocidad económica/recomendada en tuberías de impulsión", valid_range: [0.8, 3.5], source: "Diseño Boxmark / ANSI/HI" },
            compressed_air_velocity: { value: 10.0, unit: "m/s", desc: "Velocidad recomendada en redes de aire comprimido", valid_range: [6.0, 15.0], source: "ISO 8573" }
        }
    },
    materials: {
        name: "Ciencia de Materiales y Resistencia Mecánica",
        scales: {
            steel_elastic_modulus: { value: 210e9, unit: "Pa", desc: "Módulo de Young del acero estructural (210 GPa)", source: "ASTM A36" },
            steel_yield_strength: { value: 250e6, unit: "Pa", desc: "Límite elástico nominal acero A36 (250 MPa)", source: "ASTM" },
            aluminum_modulus: { value: 70e9, unit: "Pa", desc: "Módulo de Young de aleaciones de aluminio (70 GPa)", source: "ASM" },
            copper_density: { value: 8960.0, unit: "kg/m^3", desc: "Densidad del cobre electrolítico", source: "ASM" },
            steel_density: { value: 7850.0, unit: "kg/m^3", desc: "Densidad del acero al carbono", source: "ASM" }
        }
    },
    thermodynamics: {
        name: "Termodinámica y Transferencia de Calor",
        scales: {
            water_heat_capacity: { value: 4184.0, unit: "J/(kg*K)", desc: "Calor específico del agua líquida (1 cal/g·K)", source: "NIST" },
            air_heat_capacity: { value: 1005.0, unit: "J/(kg*K)", desc: "Calor específico del aire a presión constante cp", source: "NIST" },
            stefan_boltzmann: { value: 5.670374e-8, unit: "W/(m^2*K^4)", desc: "Constante de radiación de Stefan-Boltzmann", source: "CODATA" },
            copper_conductivity: { value: 401.0, unit: "W/(m*K)", desc: "Conductividad térmica del cobre puro", source: "NIST" },
            water_conductivity: { value: 0.606, unit: "W/(m*K)", desc: "Conductividad térmica del agua a 20 °C", source: "NIST" }
        }
    }
};

const SANITY_RULES_CATALOG = [
    {
        id: "COMMON-EFFICIENCY-BOUNDS",
        name: "Límites Físicos de Rendimiento y Eficiencia",
        domain: "Termodinámica / Máquinas",
        severity: "FAIL",
        description: "Verifica que el rendimiento o eficiencia (η) cumpla estrictamente 0 ≤ η ≤ 1 (0% a 100%).",
        physicalLaw: "Primer y Segundo Principio de la Termodinámica",
        possibleCauses: [
            "Confusión entre Coeficiente de Rendimiento (COP > 1 en bombas de calor/refrigeración) y eficiencia térmica (η ≤ 1)",
            "Ingreso del porcentaje en lugar de la fracción adimensional (ej. 85 en vez de 0.85)",
            "Inversión entre potencia absorbida y potencia útil en la fórmula"
        ]
    },
    {
        id: "COMMON-ABS-TEMP-POSITIVITY",
        name: "Positividad de Temperatura Absoluta",
        domain: "Termodinámica",
        severity: "FAIL",
        description: "Verifica que toda temperatura termodinámica absoluta sea estrictamente T ≥ 0 K.",
        physicalLaw: "Tercer Principio de la Termodinámica / Cero Absoluto",
        possibleCauses: [
            "Uso de escala relativa Celsius (°C) o Fahrenheit (°F) en fórmulas que exigen escala absoluta (K o R)",
            "Error de signo algebraico en un balance entálpico o de calor sensible"
        ]
    },
    {
        id: "FLUID-ABS-PRESSURE-POSITIVITY",
        name: "Positividad de Presión Absoluta",
        domain: "Mecánica de Fluidos",
        severity: "FAIL",
        description: "Verifica que la presión absoluta cumpla p_abs ≥ 0 Pa (el vacío perfecto es 0 Pa absolutos).",
        physicalLaw: "Cinética Molecular de Fluidos / Mecánica de Medios Continuos",
        possibleCauses: [
            "Confusión entre presión manométrica relativa (que sí puede ser negativa en vacío) y presión absoluta (p_abs = p_atm + p_man)",
            "Divergencia numérica en simulaciones CFD o solvers de redes de tuberías",
            "Cavitación extrema no capturada por el modelo físico"
        ]
    },
    {
        id: "FLUID-INCOMPRESSIBLE-MACH",
        name: "Límite de Régimen Incompresible (Mach)",
        domain: "Aerodinámica / Flujo de Gases",
        severity: "WARNING",
        description: "Comprueba si el número de Mach (Ma = v / c) supera el umbral de incompresibilidad (Ma > 0.3).",
        physicalLaw: "Ecuaciones de Navier-Stokes Compresibles vs Incompresibles",
        possibleCauses: [
            "Uso indebido de ecuaciones incompresibles (Bernoulli, Darcy-Weisbach convencional) en régimen transónico o supersónico",
            "Velocidad del sonido del medio calculada erróneamente o subestimada",
            "Ignorar la variación de densidad (Δρ/ρ > 5%) provocada por el gradiente de presión"
        ]
    },
    {
        id: "RELATIVISTIC-LIGHT-SPEED-LIMIT",
        name: "Límite de Velocidad Superlumínica",
        domain: "Cinemática / Relatividad",
        severity: "FAIL",
        description: "Verifica que la velocidad de cualquier partícula o flujo con masa cumpla v < c (299.792 km/s).",
        physicalLaw: "Relatividad Especial de Einstein / Causalidad Relativista",
        possibleCauses: [
            "Aplicación de mecánica clásica newtoniana en regímenes donde el factor de Lorentz γ es dominante",
            "Error de escala de tiempo o longitud produciendo velocidades hiperbólicas ficticias"
        ]
    },
    {
        id: "INDUSTRIAL-PIPE-VELOCITY",
        name: "Límites de Velocidad en Tuberías Industriales",
        domain: "Hidráulica de Planta / Piping",
        severity: "WARNING",
        description: "Detecta velocidades excesivas en conductos (agua: > 3.5 m/s en impulsión, > 1.5 m/s en succión) o excesivamente bajas (< 0.6 m/s con riesgo de sedimentación).",
        physicalLaw: "Normas de Ingeniería de Procesos (ANSI/HI, Hydraulic Institute, Criterio Boxmark)",
        possibleCauses: [
            "Subdimensionamiento del diámetro interior de tubería (D)",
            "Caudal volumétrico (Q) expresado en m³/h en lugar de m³/s",
            "Riesgo inminente de golpe de ariete severo, cavitación y erosión prematura de codos y válvulas"
        ]
    },
    {
        id: "STRUCTURAL-THEORETICAL-STRENGTH",
        name: "Límite Teórico de Resistencia Mecánica",
        domain: "Ciencia de Materiales / Estructuras",
        severity: "FAIL",
        description: "Verifica que las tensiones mecánicas no excedan el límite cohesivo teórico de Griffith (~E/10).",
        physicalLaw: "Física del Estado Sólido / Cohesión Interatómica",
        possibleCauses: [
            "Confusión de unidades de presión/tensión (ej. Pa en vez de MPa o bar en vez de N/mm²)",
            "Singularidad por concentración de tensiones con radio de entalle nulo en análisis por elementos finitos (FEA)"
        ]
    },
    {
        id: "RADIATION-STEFAN-BOLTZMANN-LIMIT",
        name: "Límite de Radiación de Cuerpo Negro",
        domain: "Transferencia de Calor",
        severity: "FAIL",
        description: "Verifica que el flujo radiante térmico superficial no supere el cuerpo negro ideal: q\" ≤ σ·T^4.",
        physicalLaw: "Ley de Radiación de Planck / Stefan-Boltzmann",
        possibleCauses: [
            "Emisividad mayor a 1 ingresada por error",
            "Temperatura de superficie evaluada en grados Celsius en lugar de Kelvin absoluto"
        ]
    },
    {
        id: "OOM-CHECK-001",
        name: "Desviación de Orden de Magnitud (OOM)",
        domain: "Metrología y Órdenes de Escala",
        severity: "SUSPICIOUS",
        description: "Detecta discrepancias de factor 10^2 o 10^3 respecto a las escalas de referencia del sistema físico.",
        physicalLaw: "Coherencia Dimensional y Consistencia de Órdenes de Magnitud",
        possibleCauses: [
            "Error clásico de prefijo métrico (km vs m, mm vs m, kW vs W, kPa vs Pa, ton vs kg)",
            "Confusión entre unidades anglosajonas e internacionales (libras vs kg, psi vs bar, galones vs litros)",
            "Suposición física completamente fuera del orden natural del fenómeno"
        ]
    }
];

const CURATED_SANITY_CASES = [
    {
        id: "case_efficiency_pump",
        title: "Bomba Centrífuga con Rendimiento Imposible",
        domain: "thermodynamics",
        system: "industrial_pump",
        model: "steady_flow",
        description: "Una memoria de cálculo reporta una bomba de alimentación con potencia hidráulica mayor que la potencia al freno del motor.",
        quantities: [
            { name: "shaft_power", value: 15.0, unit: "kW", phys_type: "generic", desc: "Potencia mecánica suministrada al eje" },
            { name: "hydraulic_power", value: 20.7, unit: "kW", phys_type: "generic", desc: "Potencia transmitida al fluido (Q·Δp)" },
            { name: "pump_efficiency", value: 1.38, unit: "", phys_type: "efficiency", is_absolute: true, desc: "Eficiencia de bombeo calculada" }
        ],
        expectedAlerts: ["COMMON-EFFICIENCY-BOUNDS"],
        diagnosis: "El rendimiento η = 1.38 (138%) viola el Primer Principio de la Termodinámica. Una máquina no puede entregar más energía útil de la que absorbe. Causa usual: inversión de términos (P_eje / P_hidr en vez de P_hidr / P_eje) o confusión con COP."
    },
    {
        id: "case_negative_pressure",
        title: "Línea de Succión con Presión Absoluta Negativa",
        domain: "fluid_mechanics",
        system: "piping_network",
        model: "incompressible",
        description: "Un solver de pérdidas de carga calcula una presión de -25 kPa en la brida de aspiración de una bomba.",
        quantities: [
            { name: "suction_pressure", value: -25000.0, unit: "Pa", phys_type: "absolute_pressure", is_absolute: true, desc: "Presión absoluta de succión" },
            { name: "fluid_velocity", value: 1.8, unit: "m/s", phys_type: "generic", desc: "Velocidad del agua en la tubería" }
        ],
        expectedAlerts: ["FLUID-ABS-PRESSURE-POSITIVITY"],
        diagnosis: "Una presión absoluta de -25 kPa es físicamente imposible (el cero absoluto de presión es el vacío puro). El ingeniero calculó la presión manométrica (-25 kPa_g, es decir 25 kPa de vacío respecto a 101.3 kPa_atm, lo que equivale a 76.3 kPa absolutos), pero la etiquetó como absoluta."
    },
    {
        id: "case_transonic_incompressible",
        title: "Conducto de Gas con Velocidad Transónica bajo Modelo Incompresible",
        domain: "fluid_mechanics",
        system: "aerodynamic_duct",
        model: "incompressible",
        description: "Un análisis asume aire incompresible fluyendo a 280 m/s a través de una tobera de escape.",
        quantities: [
            { name: "velocity", value: 280.0, unit: "m/s", phys_type: "generic", desc: "Velocidad del gas en la tobera" },
            { name: "sound_speed", value: 343.0, unit: "m/s", phys_type: "generic", desc: "Velocidad local del sonido" },
            { name: "mach_number", value: 0.816, unit: "", phys_type: "generic", desc: "Número de Mach del flujo" }
        ],
        expectedAlerts: ["FLUID-INCOMPRESSIBLE-MACH"],
        diagnosis: "El número de Mach resultante Ma = 0.816 supera con creces el límite de incompresibilidad (Ma ≤ 0.3). Los efectos de compresibilidad provocarán variaciones de densidad del 35%, choques locales y bloqueo sónico, invalidando completamente las ecuaciones incompresibles utilizadas."
    },
    {
        id: "case_orbital_oom",
        title: "Velocidad de Escape Terrestre con Error de Escala",
        domain: "astrophysics",
        system: "earth",
        model: "newtonian",
        description: "Un cálculo aeroespacial reporta la velocidad de escape como 11.2 m/s.",
        quantities: [
            { name: "earth_escape_velocity", value: 11.2, unit: "m/s", phys_type: "generic", desc: "Velocidad de escape calculada" }
        ],
        expectedAlerts: ["OOM-CHECK-001"],
        diagnosis: "La velocidad de escape de la Tierra es 11.2 km/s (11.186 m/s). El valor ingresado (11.2 m/s) es exactamente 1000 veces menor que la escala real del planeta, una velocidad menor que la de una bicicleta rápida. Típico error de factor 1000 entre km/s y m/s."
    },
    {
        id: "case_cryo_negative_temp",
        title: "Cálculo Criogénico con Temperatura Absoluta Negativa",
        domain: "thermodynamics",
        system: "cryogenic_tank",
        model: "ideal_gas",
        description: "Un termógrafo criogénico digital registra una temperatura de proceso ingresada erróneamente en Kelvin.",
        quantities: [
            { name: "storage_temperature", value: -196.0, unit: "K", phys_type: "absolute_temperature", is_absolute: true, desc: "Temperatura absoluta del tanque" }
        ],
        expectedAlerts: ["COMMON-ABS-TEMP-POSITIVITY"],
        diagnosis: "La temperatura absoluta no puede ser menor a 0 K. El valor -196 corresponde a -196 °C (punto de ebullición del nitrógeno líquido a 1 atm), que equivale a 77.15 K absolutos. Confundir la unidad relativa con la absoluta conduce a la división por números negativos en ecuaciones de estado."
    },
    {
        id: "case_piping_erosive_velocity",
        title: "Velocidad de Tubería Erosiva en Planta de Producción",
        domain: "fluids",
        system: "piping_network",
        model: "industrial_standard",
        description: "En una línea de agua desmineralizada de 1 pulgada se fuerza un caudal excesivo.",
        quantities: [
            { name: "pipe_water_velocity", value: 14.5, unit: "m/s", phys_type: "generic", desc: "Velocidad del agua en el conducto" },
            { name: "inlet_pressure", value: 600000.0, unit: "Pa", phys_type: "absolute_pressure", is_absolute: true, desc: "Presión manométrica de impulsión" }
        ],
        expectedAlerts: ["INDUSTRIAL-PIPE-VELOCITY", "OOM-CHECK-001"],
        diagnosis: "Una velocidad de 14.5 m/s para agua líquida supera en más de 4 veces el límite máximo admisible de planta (3.0 - 3.5 m/s). Provocará erosión acelerada por impacto en accesorios, sobrepresión por golpe de ariete destructivo de más de 18 bar al cierre de válvulas, y caída de presión intolerable."
    },
    {
        id: "case_superluminal",
        title: "Haz de Electrones con Velocidad Superlumínica",
        domain: "astrophysics",
        system: "particle_beam",
        model: "classical_newtonian",
        description: "Se calcula la aceleración de electrones usando la cinemática clásica E_k = 0.5·m·v².",
        quantities: [
            { name: "electron_velocity", value: 4.2e8, unit: "m/s", phys_type: "generic", desc: "Velocidad calculada para el electrón" }
        ],
        expectedAlerts: ["RELATIVISTIC-LIGHT-SPEED-LIMIT"],
        diagnosis: "La velocidad calculada (420.000 km/s) supera la velocidad de la luz en el vacío c = 299.792 km/s. Se utilizó cinemática no relativista clásica para electrones de alta energía donde la masa relativista y la asíntota de Lorentz γ impiden superar c."
    },
    {
        id: "case_structural_overstress",
        title: "Tensión en Perno de Anclaje Excediendo la Cohesión Atómica",
        domain: "materials",
        system: "structural_bolt",
        model: "elasticity",
        description: "Un cálculo analítico de impacto dinámico reporta una tensión de tracción de 450 GPa.",
        quantities: [
            { name: "tensile_stress", value: 450e9, unit: "Pa", phys_type: "generic", desc: "Tensión de tracción calculada en el perno" },
            { name: "steel_elastic_modulus", value: 210e9, unit: "Pa", phys_type: "generic", desc: "Módulo de elasticidad del acero" }
        ],
        expectedAlerts: ["STRUCTURAL-THEORETICAL-STRENGTH", "OOM-CHECK-001"],
        diagnosis: "Una tensión de 450 GPa supera en más de dos veces el módulo elástico del acero (210 GPa) y supera por 20 veces el límite de rotura cohesiva atómica ideal (~20 GPa). El perno ya se habrá fracturado catastróficamente a ~800 MPa. Causa: confusión entre Pascales y MegaPascales (error de factor 10^6)."
    }
];

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        REFERENCE_SCALES,
        SANITY_RULES_CATALOG,
        CURATED_SANITY_CASES
    };
}

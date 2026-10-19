/**
 * physics-sanity-check - Motor de reglas de plausibilidad física,
 * verificación de órdenes de magnitud y metamorfosis de unidades.
 * Loren Hey - Antigravity
 */

class UnitConverter {
    static UNIT_DEFINITIONS = {
        // Longitud (Base: metro)
        'm': { base: 'm', factor: 1.0, dim: '[length]' },
        'meter': { base: 'm', factor: 1.0, dim: '[length]' },
        'km': { base: 'm', factor: 1000.0, dim: '[length]' },
        'cm': { base: 'm', factor: 0.01, dim: '[length]' },
        'mm': { base: 'm', factor: 0.001, dim: '[length]' },
        'um': { base: 'm', factor: 1e-6, dim: '[length]' },
        'nm': { base: 'm', factor: 1e-9, dim: '[length]' },
        'in': { base: 'm', factor: 0.0254, dim: '[length]' },
        'ft': { base: 'm', factor: 0.3048, dim: '[length]' },
        'mi': { base: 'm', factor: 1609.344, dim: '[length]' },

        // Masa (Base: kilogramo)
        'kg': { base: 'kg', factor: 1.0, dim: '[mass]' },
        'kilogram': { base: 'kg', factor: 1.0, dim: '[mass]' },
        'g': { base: 'kg', factor: 0.001, dim: '[mass]' },
        'mg': { base: 'kg', factor: 1e-6, dim: '[mass]' },
        'ton': { base: 'kg', factor: 1000.0, dim: '[mass]' },
        'tonne': { base: 'kg', factor: 1000.0, dim: '[mass]' },
        'lb': { base: 'kg', factor: 0.45359237, dim: '[mass]' },
        'oz': { base: 'kg', factor: 0.0283495, dim: '[mass]' },

        // Tiempo (Base: segundo)
        's': { base: 's', factor: 1.0, dim: '[time]' },
        'second': { base: 's', factor: 1.0, dim: '[time]' },
        'ms': { base: 's', factor: 0.001, dim: '[time]' },
        'us': { base: 's', factor: 1e-6, dim: '[time]' },
        'min': { base: 's', factor: 60.0, dim: '[time]' },
        'h': { base: 's', factor: 3600.0, dim: '[time]' },
        'day': { base: 's', factor: 86400.0, dim: '[time]' },
        'year': { base: 's', factor: 31557600.0, dim: '[time]' },

        // Fuerza (Base: Newton)
        'N': { base: 'N', factor: 1.0, dim: '[force]' },
        'newton': { base: 'N', factor: 1.0, dim: '[force]' },
        'kN': { base: 'N', factor: 1000.0, dim: '[force]' },
        'MN': { base: 'N', factor: 1e6, dim: '[force]' },
        'lbf': { base: 'N', factor: 4.44822, dim: '[force]' },
        'dyn': { base: 'N', factor: 1e-5, dim: '[force]' },

        // Presión y Esfuerzo (Base: Pascal)
        'Pa': { base: 'Pa', factor: 1.0, dim: '[pressure]' },
        'pascal': { base: 'Pa', factor: 1.0, dim: '[pressure]' },
        'kPa': { base: 'Pa', factor: 1000.0, dim: '[pressure]' },
        'MPa': { base: 'Pa', factor: 1e6, dim: '[pressure]' },
        'GPa': { base: 'Pa', factor: 1e9, dim: '[pressure]' },
        'bar': { base: 'Pa', factor: 100000.0, dim: '[pressure]' },
        'mbar': { base: 'Pa', factor: 100.0, dim: '[pressure]' },
        'atm': { base: 'Pa', factor: 101325.0, dim: '[pressure]' },
        'psi': { base: 'Pa', factor: 6894.757, dim: '[pressure]' },
        'mmHg': { base: 'Pa', factor: 133.322, dim: '[pressure]' },

        // Velocidad (Base: m/s)
        'm/s': { base: 'm/s', factor: 1.0, dim: '[velocity]' },
        'km/h': { base: 'm/s', factor: 1.0 / 3.6, dim: '[velocity]' },
        'km/s': { base: 'm/s', factor: 1000.0, dim: '[velocity]' },
        'mph': { base: 'm/s', factor: 0.44704, dim: '[velocity]' },
        'ft/s': { base: 'm/s', factor: 0.3048, dim: '[velocity]' },
        'knot': { base: 'm/s', factor: 0.514444, dim: '[velocity]' },

        // Densidad (Base: kg/m^3)
        'kg/m^3': { base: 'kg/m^3', factor: 1.0, dim: '[density]' },
        'kg/m3': { base: 'kg/m^3', factor: 1.0, dim: '[density]' },
        'g/cm^3': { base: 'kg/m^3', factor: 1000.0, dim: '[density]' },
        'g/cm3': { base: 'kg/m^3', factor: 1000.0, dim: '[density]' },
        'kg/L': { base: 'kg/m^3', factor: 1000.0, dim: '[density]' },

        // Potencia (Base: Watt)
        'W': { base: 'W', factor: 1.0, dim: '[power]' },
        'watt': { base: 'W', factor: 1.0, dim: '[power]' },
        'kW': { base: 'W', factor: 1000.0, dim: '[power]' },
        'MW': { base: 'W', factor: 1e6, dim: '[power]' },
        'GW': { base: 'W', factor: 1e9, dim: '[power]' },
        'hp': { base: 'W', factor: 745.699872, dim: '[power]' },
        'cv': { base: 'W', factor: 735.49875, dim: '[power]' },

        // Energía (Base: Joule)
        'J': { base: 'J', factor: 1.0, dim: '[energy]' },
        'joule': { base: 'J', factor: 1.0, dim: '[energy]' },
        'kJ': { base: 'J', factor: 1000.0, dim: '[energy]' },
        'MJ': { base: 'J', factor: 1e6, dim: '[energy]' },
        'GJ': { base: 'J', factor: 1e9, dim: '[energy]' },
        'cal': { base: 'J', factor: 4.184, dim: '[energy]' },
        'kcal': { base: 'J', factor: 4184.0, dim: '[energy]' },
        'Wh': { base: 'J', factor: 3600.0, dim: '[energy]' },
        'kWh': { base: 'J', factor: 3.6e6, dim: '[energy]' },
        'MWh': { base: 'J', factor: 3.6e9, dim: '[energy]' },
        'BTU': { base: 'J', factor: 1055.06, dim: '[energy]' },

        // Temperatura Absoluta (Base: Kelvin)
        'K': { base: 'K', factor: 1.0, dim: '[temperature]', isTemp: true },
        'kelvin': { base: 'K', factor: 1.0, dim: '[temperature]', isTemp: true },
        'degC': { base: 'K', factor: 1.0, offset: 273.15, dim: '[temperature]', isTemp: true },
        '°C': { base: 'K', factor: 1.0, offset: 273.15, dim: '[temperature]', isTemp: true },
        'degF': { base: 'K', factor: 5.0 / 9.0, offset: 459.67 * (5.0 / 9.0), dim: '[temperature]', isTemp: true },
        '°F': { base: 'K', factor: 5.0 / 9.0, offset: 459.67 * (5.0 / 9.0), dim: '[temperature]', isTemp: true },

        // Caudal Volumétrico (Base: m^3/s)
        'm^3/s': { base: 'm^3/s', factor: 1.0, dim: '[vol_flow]' },
        'm3/s': { base: 'm^3/s', factor: 1.0, dim: '[vol_flow]' },
        'm^3/h': { base: 'm^3/s', factor: 1.0 / 3600.0, dim: '[vol_flow]' },
        'm3/h': { base: 'm^3/s', factor: 1.0 / 3600.0, dim: '[vol_flow]' },
        'L/s': { base: 'm^3/s', factor: 0.001, dim: '[vol_flow]' },
        'L/min': { base: 'm^3/s', factor: 0.001 / 60.0, dim: '[vol_flow]' },
        'gpm': { base: 'm^3/s', factor: 0.0000630902, dim: '[vol_flow]' },

        // Adimensional
        '': { base: '', factor: 1.0, dim: '[dimensionless]' },
        'dimensionless': { base: '', factor: 1.0, dim: '[dimensionless]' },
        '%': { base: '', factor: 0.01, dim: '[dimensionless]' }
    };

    static convert(value, fromUnit, toUnit) {
        fromUnit = (fromUnit || '').trim();
        toUnit = (toUnit || '').trim();
        if (fromUnit === toUnit) return value;

        const defFrom = UnitConverter.UNIT_DEFINITIONS[fromUnit];
        const defTo = UnitConverter.UNIT_DEFINITIONS[toUnit];

        if (!defFrom) throw new Error(`Unidad desconocida: '${fromUnit}'`);
        if (!defTo) throw new Error(`Unidad desconocida: '${toUnit}'`);

        if (defFrom.dim !== defTo.dim) {
            throw new Error(`Incompatibilidad dimensional: No se puede convertir '${fromUnit}' (${defFrom.dim}) a '${toUnit}' (${defTo.dim}).`);
        }

        // Temperature handling with offsets
        if (defFrom.isTemp || defTo.isTemp) {
            // First convert to Kelvin
            let inKelvin = value;
            if (fromUnit === 'degC' || fromUnit === '°C') inKelvin = value + 273.15;
            else if (fromUnit === 'degF' || fromUnit === '°F') inKelvin = (value + 459.67) * (5.0 / 9.0);

            // Convert Kelvin to target
            if (toUnit === 'K' || toUnit === 'kelvin') return inKelvin;
            if (toUnit === 'degC' || toUnit === '°C') return inKelvin - 273.15;
            if (toUnit === 'degF' || toUnit === '°F') return inKelvin * (9.0 / 5.0) - 459.67;
        }

        // Standard linear scaling: value * factorFrom / factorTo
        const inBase = value * defFrom.factor;
        return inBase / defTo.factor;
    }

    static getBaseValueAndUnit(value, unit) {
        unit = (unit || '').trim();
        const def = UnitConverter.UNIT_DEFINITIONS[unit];
        if (!def) return { value, unit, baseUnit: unit };
        const converted = UnitConverter.convert(value, unit, def.base);
        return { value: converted, unit, baseUnit: def.base };
    }
}

class SanityEngine {
    constructor() {
        this.scales = (typeof REFERENCE_SCALES !== 'undefined') ? REFERENCE_SCALES : {};
    }

    evaluateCase(context, quantities) {
        const results = [];
        const qMap = {};

        // Normalise quantities
        quantities.forEach(q => {
            const baseInfo = UnitConverter.getBaseValueAndUnit(q.value, q.unit);
            qMap[q.name] = {
                ...q,
                baseValue: baseInfo.value,
                baseUnit: baseInfo.baseUnit
            };
        });

        // 1. Rule: Efficiency Bounds
        this.checkEfficiencyBounds(context, qMap, results);

        // 2. Rule: Absolute Temperature Positivity
        this.checkAbsoluteTemperature(context, qMap, results);

        // 3. Rule: Absolute Pressure Positivity
        this.checkAbsolutePressure(context, qMap, results);

        // 4. Rule: Incompressible Mach limit
        this.checkIncompressibleMach(context, qMap, results);

        // 5. Rule: Speed of Light Relativistic Limit
        this.checkRelativisticLimit(context, qMap, results);

        // 6. Rule: Industrial Pipe Velocity (Boxmark Piping Standard)
        this.checkIndustrialPipeVelocity(context, qMap, results);

        // 7. Rule: Structural Theoretical Strength (Griffith limit)
        this.checkStructuralStrength(context, qMap, results);

        // 8. Rule: Order of Magnitude (OOM) log10 comparison
        this.checkOrderOfMagnitude(context, qMap, results);

        return {
            context,
            quantities: qMap,
            results,
            summary: this.computeSummary(results)
        };
    }

    checkEfficiencyBounds(ctx, quantities, results) {
        for (const [name, q] of Object.entries(quantities)) {
            if (q.phys_type === 'efficiency' || name.toLowerCase().includes('efficiency') || name.toLowerCase().includes('rendimiento')) {
                let val = q.value;
                if (q.unit === '%') val = val / 100.0;
                else if (q.unit === '') val = q.value;

                if (val < 0.0 || val > 1.0) {
                    results.push({
                        ruleId: "COMMON-EFFICIENCY-BOUNDS",
                        ruleName: "Límites de Rendimiento y Eficiencia",
                        severity: "FAIL",
                        message: `La eficiencia '${name}' calculada es ${val} (${(val * 100).toFixed(1)}%), fuera del intervalo termodinámico admisible [0, 1].`,
                        possibleCauses: [
                            "Confusión entre Coeficiente de Rendimiento (COP > 1 en bombas de calor/refrigeración) y rendimiento térmico (η ≤ 1).",
                            "Se ingresó el valor como porcentaje en lugar de fracción adimensional (ej. 80 en lugar de 0.80).",
                            "Inversión de términos en la fórmula: se dividió potencia absorbida por potencia útil en vez de útil / absorbida."
                        ],
                        data: { value: val, unit: "" }
                    });
                } else {
                    results.push({
                        ruleId: "COMMON-EFFICIENCY-BOUNDS",
                        ruleName: "Límites de Rendimiento y Eficiencia",
                        severity: "PASS",
                        message: `Eficiencia '${name}' en rango admisible: ${(val * 100).toFixed(1)}%.`,
                        data: { value: val }
                    });
                }
            }
        }
    }

    checkAbsoluteTemperature(ctx, quantities, results) {
        for (const [name, q] of Object.entries(quantities)) {
            if (q.phys_type === 'absolute_temperature' || q.is_absolute === true && (q.unit === 'K' || q.unit === 'degC' || q.unit === '°C')) {
                try {
                    const tempK = UnitConverter.convert(q.value, q.unit, 'K');
                    if (tempK < 0.0) {
                        results.push({
                            ruleId: "COMMON-ABS-TEMP-POSITIVITY",
                            ruleName: "Positividad de Temperatura Absoluta",
                            severity: "FAIL",
                            message: `La temperatura absoluta '${name}' no puede ser inferior a 0 K (valor obtenido: ${tempK.toFixed(2)} K = ${q.value} ${q.unit}).`,
                            possibleCauses: [
                                "Se usó temperatura relativa (°C) tratándola como si fuera Kelvin en una ecuación termodinámica.",
                                "Error algebraico o divergencia en la resolución del balance entálpico."
                            ],
                            data: { tempK, rawValue: q.value, rawUnit: q.unit }
                        });
                    } else {
                        results.push({
                            ruleId: "COMMON-ABS-TEMP-POSITIVITY",
                            ruleName: "Positividad de Temperatura Absoluta",
                            severity: "PASS",
                            message: `Temperatura absoluta '${name}' conforme: ${tempK.toFixed(2)} K.`,
                            data: { tempK }
                        });
                    }
                } catch (e) {
                    // ignore if conversion fails
                }
            }
        }
    }

    checkAbsolutePressure(ctx, quantities, results) {
        for (const [name, q] of Object.entries(quantities)) {
            const isAbs = q.is_absolute === true || q.phys_type === 'absolute_pressure' || name.toLowerCase().includes('abs');
            if (isAbs && (q.unit === 'Pa' || q.unit === 'kPa' || q.unit === 'bar' || q.unit === 'psi')) {
                try {
                    const pPa = UnitConverter.convert(q.value, q.unit, 'Pa');
                    if (pPa < 0.0) {
                        results.push({
                            ruleId: "FLUID-ABS-PRESSURE-POSITIVITY",
                            ruleName: "Positividad de Presión Absoluta",
                            severity: "FAIL",
                            message: `La presión absoluta '${name}' es negativa (${q.value} ${q.unit} = ${pPa.toFixed(0)} Pa). El cero absoluto de presión es el vacío perfecto (0 Pa).`,
                            possibleCauses: [
                                "Confusión entre presión manométrica relativa (que sí puede ser negativa en vacío) y presión absoluta: p_abs = p_atm + p_man.",
                                "Divergencia numérica en el solver hidráulico o de red de tuberías.",
                                "Fenómeno de cavitación severa o rotura de columna líquida no modelado."
                            ],
                            data: { pPa, rawValue: q.value, rawUnit: q.unit }
                        });
                    } else {
                        results.push({
                            ruleId: "FLUID-ABS-PRESSURE-POSITIVITY",
                            ruleName: "Positividad de Presión Absoluta",
                            severity: "PASS",
                            message: `Presión absoluta '${name}' conforme: ${(pPa / 1000).toFixed(2)} kPa.`,
                            data: { pPa }
                        });
                    }
                } catch (e) {
                    // ignore
                }
            }
        }
    }

    checkIncompressibleMach(ctx, quantities, results) {
        const isInc = ctx.model === 'incompressible' || (ctx.assumptions && ctx.assumptions.includes('incompressible'));
        let mach = null;

        for (const [name, q] of Object.entries(quantities)) {
            if (name.toLowerCase().includes('mach')) {
                mach = q.value;
                break;
            }
        }

        if (mach === null && quantities['velocity'] && quantities['sound_speed']) {
            const v = UnitConverter.convert(quantities['velocity'].value, quantities['velocity'].unit, 'm/s');
            const c = UnitConverter.convert(quantities['sound_speed'].value, quantities['sound_speed'].unit, 'm/s');
            if (c > 0) mach = v / c;
        }

        if (mach !== null) {
            const threshold = parseFloat(ctx.metadata?.mach_threshold || 0.3);
            if (isInc && mach > threshold) {
                results.push({
                    ruleId: "FLUID-INCOMPRESSIBLE-MACH",
                    ruleName: "Límite de Régimen Incompresible (Mach)",
                    severity: "WARNING",
                    message: `La hipótesis de flujo incompresible queda invalidada: Mach calculado = ${mach.toFixed(3)} > ${threshold}.`,
                    possibleCauses: [
                        "Uso indebido de ecuaciones incompresibles (Bernoulli o Darcy convencional) en régimen donde la variación de densidad Δρ/ρ supera el 5%.",
                        "Velocidad del sonido subestimada para el medio en cuestión.",
                        "Flujo transónico o compresible que requiere ecuaciones de Navier-Stokes compresibles o relaciones isentrópicas de Saint-Venant."
                    ],
                    data: { mach, threshold }
                });
            } else if (isInc) {
                results.push({
                    ruleId: "FLUID-INCOMPRESSIBLE-MACH",
                    ruleName: "Límite de Régimen Incompresible (Mach)",
                    severity: "PASS",
                    message: `Número de Mach = ${mach.toFixed(3)} ≤ ${threshold}. Hipótesis incompresible plenamente justificada.`,
                    data: { mach, threshold }
                });
            }
        }
    }

    checkRelativisticLimit(ctx, quantities, results) {
        const c = 299792458.0; // m/s
        for (const [name, q] of Object.entries(quantities)) {
            if (q.unit === 'm/s' || q.unit === 'km/s' || q.unit === 'km/h') {
                try {
                    const v = UnitConverter.convert(q.value, q.unit, 'm/s');
                    if (v >= c) {
                        results.push({
                            ruleId: "RELATIVISTIC-LIGHT-SPEED-LIMIT",
                            ruleName: "Límite de Velocidad Superlumínica",
                            severity: "FAIL",
                            message: `La velocidad '${name}' (${(v / 1000).toLocaleString()} km/s) supera o iguala la velocidad de la luz en el vacío c (299.792 km/s).`,
                            possibleCauses: [
                                "Aplicación de cinemática newtoniana clásica E_k = 0.5·m·v² a partículas relativistas con factor de Lorentz γ >> 1.",
                                "Error grave en la escala de tiempo o distancia en la simulación."
                            ],
                            data: { velocity: v, speedOfLight: c }
                        });
                    }
                } catch (e) {
                    // ignore
                }
            }
        }
    }

    checkIndustrialPipeVelocity(ctx, quantities, results) {
        for (const [name, q] of Object.entries(quantities)) {
            if (name.includes('pipe') || name.includes('tuber') || name.includes('water_vel')) {
                try {
                    const v = UnitConverter.convert(q.value, q.unit, 'm/s');
                    if (v > 4.5) {
                        results.push({
                            ruleId: "INDUSTRIAL-PIPE-VELOCITY",
                            ruleName: "Límites de Velocidad en Tuberías Industriales",
                            severity: "WARNING",
                            message: `Velocidad en tubería '${name}' (${v.toFixed(2)} m/s) excede el umbral industrial recomendado (0.8 a 3.5 m/s).`,
                            possibleCauses: [
                                "Subdimensionamiento severo del diámetro de tubería.",
                                "Pérdidas de carga cuadráticas extremas Δp ∝ v² y consumo excesivo en bombas.",
                                "Riesgo crítico de golpe de ariete destructivo de Joukowsky (Δp = ρ·a·Δv) y cavitación en curvas y válvulas."
                            ],
                            data: { velocity: v, maxRecommended: 3.5 }
                        });
                    } else if (v < 0.4 && v > 0) {
                        results.push({
                            ruleId: "INDUSTRIAL-PIPE-VELOCITY",
                            ruleName: "Límites de Velocidad en Tuberías Industriales",
                            severity: "INFO",
                            message: `Velocidad baja en tubería '${name}' (${v.toFixed(2)} m/s < 0.6 m/s): riesgo de sedimentación en fluidos industriales.`,
                            possibleCauses: ["Sobredimensionamiento deliberado o régimen de caudal mínimo."],
                            data: { velocity: v, minRecommended: 0.6 }
                        });
                    }
                } catch (e) {
                    // ignore
                }
            }
        }
    }

    checkStructuralStrength(ctx, quantities, results) {
        for (const [name, q] of Object.entries(quantities)) {
            if (name.includes('stress') || name.includes('tension') || name.includes('presion')) {
                try {
                    const sigma = UnitConverter.convert(q.value, q.unit, 'Pa');
                    if (sigma > 30e9) { // 30 GPa exceeds theoretical atomic bonding of metals
                        results.push({
                            ruleId: "STRUCTURAL-THEORETICAL-STRENGTH",
                            ruleName: "Límite Teórico de Resistencia Mecánica",
                            severity: "FAIL",
                            message: `La tensión '${name}' (${(sigma / 1e9).toFixed(1)} GPa) supera la resistencia cohesiva teórica de los enlaces atómicos metálicos (~E/10).`,
                            possibleCauses: [
                                "Confusión entre Pascales y MegaPascales (error de factor 10^6).",
                                "Singularidad numérica en vértice con radio de acuerdo nulo en análisis por elementos finitos (FEA)."
                            ],
                            data: { stressPa: sigma }
                        });
                    }
                } catch (e) {
                    // ignore
                }
            }
        }
    }

    checkOrderOfMagnitude(ctx, quantities, results) {
        const domain = ctx.domain || '';
        const domainScales = this.scales[domain]?.scales || {};

        for (const [name, q] of Object.entries(quantities)) {
            let refKey = null;

            // Direct match
            if (domainScales[name]) refKey = name;
            else {
                // Try matching without prefixes or sub-matches
                for (const key of Object.keys(domainScales)) {
                    if (name.includes(key) || key.includes(name)) {
                        refKey = key;
                        break;
                    }
                }
            }

            if (refKey && domainScales[refKey]) {
                const ref = domainScales[refKey];
                try {
                    const qInRef = UnitConverter.convert(q.value, q.unit, ref.unit);
                    if (qInRef > 0 && ref.value > 0) {
                        const logDiff = Math.log10(qInRef / ref.value);
                        if (Math.abs(logDiff) >= 1.5) {
                            const factorStr = Math.pow(10, Math.abs(logDiff)).toFixed(0);
                            const dirStr = logDiff < 0 ? "veces menor" : "veces mayor";
                            const severity = Math.abs(logDiff) >= 3.0 ? "WARNING" : "SUSPICIOUS";

                            results.push({
                                ruleId: "OOM-CHECK-001",
                                ruleName: "Desviación de Orden de Magnitud",
                                severity,
                                message: `La magnitud '${name}' (${q.value} ${q.unit}) es ~${factorStr} ${dirStr} que la escala de referencia para ${ctx.system || domain} (${ref.value} ${ref.unit} - ${ref.desc}).`,
                                possibleCauses: [
                                    "Error clásico de prefijo métrico (km vs m, mm vs m, kW vs W, kPa vs Pa).",
                                    "Factor de escala de 1000 omitido o multiplicado incorrectamente.",
                                    "Hipótesis del modelo físico severamente violada."
                                ],
                                data: { logDiff, refValue: ref.value, refUnit: ref.unit, qInRef }
                            });
                        }
                    }
                } catch (e) {
                    // Dimensionality mismatch
                }
            }
        }
    }

    computeSummary(results) {
        const summary = { PASS: 0, INFO: 0, SUSPICIOUS: 0, WARNING: 0, FAIL: 0 };
        results.forEach(r => {
            if (summary[r.severity] !== undefined) summary[r.severity]++;
        });
        return summary;
    }
}

class MetamorphicTester {
    /**
     * Executes metamorphic unit testing over a mathematical simulation model.
     * Perturbs input units, evaluates function, and validates physical output invariance.
     */
    static testModel(modelFn, baseInputs, perturbations) {
        // 1. Base evaluation
        const baseOutput = modelFn(baseInputs);
        const results = [];

        // 2. Perturbed evaluations
        perturbations.forEach(pert => {
            const perturbedInputs = {};
            for (const [k, q] of Object.entries(baseInputs)) {
                if (pert.targetUnits[k]) {
                    const newUnit = pert.targetUnits[k];
                    const newVal = UnitConverter.convert(q.value, q.unit, newUnit);
                    perturbedInputs[k] = { value: newVal, unit: newUnit, name: q.name };
                } else {
                    perturbedInputs[k] = { ...q };
                }
            }

            try {
                const perturbedOutput = modelFn(perturbedInputs);

                // Compare each output variable in base units
                let allPassed = true;
                const comparison = {};

                for (const outKey of Object.keys(baseOutput)) {
                    const baseOutQ = baseOutput[outKey];
                    const pertOutQ = perturbedOutput[outKey];

                    const baseValInSI = UnitConverter.convert(baseOutQ.value, baseOutQ.unit, baseOutQ.unit);
                    const pertValInSI = UnitConverter.convert(pertOutQ.value, pertOutQ.unit, baseOutQ.unit);

                    const relError = Math.abs((pertValInSI - baseValInSI) / (baseValInSI || 1.0));
                    const isInvariant = relError < 1e-4;

                    comparison[outKey] = {
                        baseVal: baseValInSI,
                        pertVal: pertValInSI,
                        relError,
                        isInvariant
                    };

                    if (!isInvariant) allPassed = false;
                }

                results.push({
                    name: pert.name,
                    passed: allPassed,
                    comparison,
                    severity: allPassed ? "PASS" : "FAIL",
                    message: allPassed
                        ? `Invarianza metamórfica verificada: el modelo es insensible al cambio de unidades (${pert.name}).`
                        : `Violación de invarianza metamórfica: el resultado difiere significativamente al cambiar unidades. Indica constantes con unidades implícitas hardcodeadas.`
                });
            } catch (err) {
                results.push({
                    name: pert.name,
                    passed: false,
                    severity: "FAIL",
                    message: `Error al evaluar con unidades perturbadas: ${err.message}`
                });
            }
        });

        return {
            baseOutput,
            results
        };
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        UnitConverter,
        SanityEngine,
        MetamorphicTester
    };
}

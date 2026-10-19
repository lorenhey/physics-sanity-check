/**
 * physics-sanity-check - Controlador Principal de la Aplicación Web
 * Loren Hey - Antigravity
 */

document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initAuditor();
    initMetamorphic();
    initRulesCatalog();
    initScalesCatalog();
    initTerminal();

    if (window.renderMathInElement) {
        renderMathInElement(document.body, {
            delimiters: [
                { left: "$$", right: "$$", display: true },
                { left: "$", right: "$", display: false }
            ]
        });
    }
});

/* =========================================================================
   TABS CONTROLLER
   ========================================================================= */
function initTabs() {
    const tabButtons = document.querySelectorAll('.nav-tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-tab');
            tabButtons.forEach(b => b.classList.remove('active'));
            tabPanels.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const targetPanel = document.getElementById(targetId);
            if (targetPanel) {
                targetPanel.classList.add('active');
                if (window.renderMathInElement) {
                    renderMathInElement(targetPanel, {
                        delimiters: [
                            { left: "$$", right: "$$", display: true },
                            { left: "$", right: "$", display: false }
                        ]
                    });
                }
            }
        });
    });
}

/* =========================================================================
   AUDITOR & SANITY CHECKER
   ========================================================================= */
let currentAuditorQuantities = [];
let currentContext = { domain: "thermodynamics", system: "industrial_pump", model: "steady_flow", assumptions: [] };
const sanityEngine = new SanityEngine();

function initAuditor() {
    const caseSelect = document.getElementById('auditor-case-select');
    const btnEvaluate = document.getElementById('btn-auditor-evaluate');
    const btnAddQuantity = document.getElementById('btn-auditor-add-q');
    const btnReset = document.getElementById('btn-auditor-reset');

    // Populate cases
    CURATED_SANITY_CASES.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = `${c.title} (${c.domain})`;
        caseSelect.appendChild(opt);
    });

    caseSelect.addEventListener('change', () => {
        const cId = caseSelect.value;
        if (!cId) return;
        loadCase(cId);
    });

    btnEvaluate.addEventListener('click', () => {
        runAuditorEvaluation();
    });

    btnAddQuantity.addEventListener('click', () => {
        openAddQuantityModal();
    });

    btnReset.addEventListener('click', () => {
        currentAuditorQuantities = [];
        renderAuditorQuantitiesTable();
        document.getElementById('auditor-results-container').innerHTML = '<p class="text-muted">No hay variables cargadas.</p>';
        showToast("Variables reiniciadas.", "info");
    });

    // Load initial case: Bomba centrífuga con rendimiento imposible
    loadCase('case_efficiency_pump');
}

function loadCase(caseId) {
    const found = CURATED_SANITY_CASES.find(c => c.id === caseId);
    if (!found) return;

    currentContext = {
        domain: found.domain,
        system: found.system,
        model: found.model,
        assumptions: found.assumptions || []
    };

    currentAuditorQuantities = JSON.parse(JSON.stringify(found.quantities));

    // Update context inputs
    document.getElementById('ctx-domain').value = currentContext.domain;
    document.getElementById('ctx-system').value = currentContext.system || '';
    document.getElementById('ctx-model').value = currentContext.model || '';

    // Update case description box
    const descBox = document.getElementById('auditor-case-description');
    if (descBox) {
        descBox.innerHTML = `
            <div class="case-desc-box">
                <h4><i class="fas fa-stethoscope"></i> ${found.title}</h4>
                <p>${found.description}</p>
                <div class="case-diagnosis-hint">
                    <i class="fas fa-lightbulb"></i> <strong>Pistas del problema:</strong> ${found.diagnosis}
                </div>
            </div>
        `;
    }

    renderAuditorQuantitiesTable();
    runAuditorEvaluation();
}

function renderAuditorQuantitiesTable() {
    const container = document.getElementById('auditor-quantities-table-body');
    if (!container) return;

    if (currentAuditorQuantities.length === 0) {
        container.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No hay variables cargadas en el caso.</td></tr>`;
        return;
    }

    let html = '';
    currentAuditorQuantities.forEach((q, idx) => {
        html += `
            <tr>
                <td><strong>${q.name}</strong><div class="text-dim text-xs">${q.desc || ''}</div></td>
                <td>
                    <input type="number" step="any" class="table-inline-input" value="${q.value}" onchange="updateQuantityValue(${idx}, this.value)">
                </td>
                <td>
                    <input type="text" class="table-inline-input unit-input" value="${q.unit}" onchange="updateQuantityUnit(${idx}, this.value)">
                </td>
                <td>
                    <span class="phys-type-tag">${q.phys_type || 'generic'}</span>
                </td>
                <td class="text-right">
                    <button type="button" class="btn-icon-danger" onclick="removeQuantity(${idx})" title="Eliminar variable">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    container.innerHTML = html;
}

window.updateQuantityValue = (idx, val) => {
    currentAuditorQuantities[idx].value = parseFloat(val);
};

window.updateQuantityUnit = (idx, unit) => {
    currentAuditorQuantities[idx].unit = unit.trim();
};

window.removeQuantity = (idx) => {
    currentAuditorQuantities.splice(idx, 1);
    renderAuditorQuantitiesTable();
    runAuditorEvaluation();
};

function openAddQuantityModal() {
    const name = prompt("Nombre de la variable física (ej: flow_rate, temperature, pressure):");
    if (!name) return;
    const valStr = prompt("Valor numérico (ej: 100, -15, 1.4):", "1.0");
    if (valStr === null) return;
    const unit = prompt("Unidad (ej: m/s, Pa, kPa, bar, K, degC, kW, kg/m^3, %):", "m/s");
    if (unit === null) return;
    const physType = prompt("Tipo físico (generic, efficiency, absolute_temperature, absolute_pressure):", "generic");

    currentAuditorQuantities.push({
        name: name.trim(),
        value: parseFloat(valStr),
        unit: unit.trim(),
        phys_type: physType.trim(),
        is_absolute: physType.includes('absolute')
    });

    renderAuditorQuantitiesTable();
    runAuditorEvaluation();
    showToast(`Variable '${name}' agregada.`, "success");
}

function runAuditorEvaluation() {
    currentContext.domain = document.getElementById('ctx-domain').value.trim();
    currentContext.system = document.getElementById('ctx-system').value.trim();
    currentContext.model = document.getElementById('ctx-model').value.trim();

    const report = sanityEngine.evaluateCase(currentContext, currentAuditorQuantities);
    renderAuditorResults(report);
}

function renderAuditorResults(report) {
    const container = document.getElementById('auditor-results-container');
    const summaryContainer = document.getElementById('auditor-summary-stats');

    // Update summary pills
    summaryContainer.innerHTML = `
        <span class="stat-badge badge-fail"><i class="fas fa-times-circle"></i> ${report.summary.FAIL} Fallos</span>
        <span class="stat-badge badge-warning"><i class="fas fa-exclamation-triangle"></i> ${report.summary.WARNING} Advertencias</span>
        <span class="stat-badge badge-suspicious"><i class="fas fa-question-circle"></i> ${report.summary.SUSPICIOUS} Sospechosos</span>
        <span class="stat-badge badge-pass"><i class="fas fa-check-circle"></i> ${report.summary.PASS} Conformes</span>
    `;

    if (report.results.length === 0) {
        container.innerHTML = `<p class="text-muted">No se ejecutaron reglas sobre las variables provistas.</p>`;
        return;
    }

    let html = '';
    report.results.forEach(res => {
        const sevClass = `card-sev-${res.severity.toLowerCase()}`;
        const icon = res.severity === 'FAIL' ? 'fa-times-circle' :
                     (res.severity === 'WARNING' ? 'fa-exclamation-triangle' :
                     (res.severity === 'SUSPICIOUS' ? 'fa-question-circle' : 'fa-check-circle'));

        html += `
            <div class="sanity-alert-card ${sevClass}">
                <div class="alert-card-header">
                    <span class="sev-tag sev-${res.severity.toLowerCase()}">
                        <i class="fas ${icon}"></i> ${res.severity}
                    </span>
                    <span class="rule-id-tag">${res.ruleId}</span>
                    <strong class="rule-name-text">${res.ruleName}</strong>
                </div>
                <div class="alert-message">
                    ${res.message}
                </div>
        `;

        if (res.possibleCauses && res.possibleCauses.length > 0) {
            html += `
                <div class="possible-causes-box">
                    <div class="causes-title"><i class="fas fa-wrench"></i> Causas Físicas e Ingenieriles Probables:</div>
                    <ul>
                        ${res.possibleCauses.map(c => `<li>${c}</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        html += `</div>`;
    });

    container.innerHTML = html;

    // Check if there is an OOM check result to render on log scale
    const oomResult = report.results.find(r => r.ruleId === 'OOM-CHECK-001' && r.data?.refValue);
    const logContainer = document.getElementById('auditor-log-scale-box');
    if (oomResult && logContainer) {
        const qName = Object.keys(report.quantities).find(k => k.includes('velocity') || k.includes('radius') || k.includes('mass') || k.includes('stress')) || Object.keys(report.quantities)[0];
        const q = report.quantities[qName];
        if (q) {
            LogScaleRenderer.renderLogScale('auditor-log-scale-box', q.value, oomResult.data.refUnit, {
                value: oomResult.data.refValue,
                desc: `Escala de referencia para ${currentContext.system || currentContext.domain}`,
                source: "Base de Datos de Metrología"
            });
        }
    } else if (logContainer) {
        logContainer.innerHTML = '';
    }

    if (window.renderMathInElement) {
        renderMathInElement(container, {
            delimiters: [
                { left: "$$", right: "$$", display: true },
                { left: "$", right: "$", display: false }
            ]
        });
    }
}

/* =========================================================================
   METAMORPHIC TESTING LAB
   ========================================================================= */
function initMetamorphic() {
    const selectModel = document.getElementById('meta-model-select');
    const btnRunMeta = document.getElementById('btn-meta-run');
    const resultsContainer = document.getElementById('meta-results-container');
    const codeDisplay = document.getElementById('meta-code-display');

    const MODELS = {
        gravity_buggy: {
            title: "Ley de Gravitación Universal (Con Bug de Unidades Hardcodeadas)",
            code: `// Modelo con error de constantes con unidades implícitas
function calcularGravedad(m1, m2, r) {
    const G = 6.674e-11; // Asume N·m²/kg² pero sin conversión!
    const f = G * m1.value * m2.value / (r.value ** 2);
    return { force: { value: f, unit: "N" } };
}`,
            fn: (inputs) => {
                const G = 6.674e-11;
                const f = G * inputs.m1.value * inputs.m2.value / (inputs.r.value ** 2);
                return { force: { value: f, unit: "N" } };
            },
            inputs: {
                m1: { value: 5.972e24, unit: "kg", name: "Masa 1 (Tierra)" },
                m2: { value: 75.0, unit: "kg", name: "Masa 2 (Humano)" },
                r: { value: 6371000.0, unit: "m", name: "Distancia (Radio Tierra)" }
            },
            perturbations: [
                { name: "Longitud: metros -> milímetros (r en mm)", targetUnits: { r: "mm" } },
                { name: "Masa: kilogramos -> gramos (m2 en g)", targetUnits: { m2: "g" } },
                { name: "Masa: kilogramos -> libras (m2 en lb)", targetUnits: { m2: "lb" } }
            ]
        },
        gravity_robust: {
            title: "Ley de Gravitación Universal (Robusto con Conversión a SI)",
            code: `// Modelo robusto con normalización estricta a SI
function calcularGravedadRobusto(m1, m2, r) {
    const G = 6.674e-11;
    const m1_kg = UnitConverter.convert(m1.value, m1.unit, "kg");
    const m2_kg = UnitConverter.convert(m2.value, m2.unit, "kg");
    const r_m = UnitConverter.convert(r.value, r.unit, "m");
    const f = G * m1_kg * m2_kg / (r_m ** 2);
    return { force: { value: f, unit: "N" } };
}`,
            fn: (inputs) => {
                const G = 6.674e-11;
                const m1_kg = UnitConverter.convert(inputs.m1.value, inputs.m1.unit, "kg");
                const m2_kg = UnitConverter.convert(inputs.m2.value, inputs.m2.unit, "kg");
                const r_m = UnitConverter.convert(inputs.r.value, inputs.r.unit, "m");
                const f = G * m1_kg * m2_kg / (r_m ** 2);
                return { force: { value: f, unit: "N" } };
            },
            inputs: {
                m1: { value: 5.972e24, unit: "kg", name: "Masa 1 (Tierra)" },
                m2: { value: 75.0, unit: "kg", name: "Masa 2 (Humano)" },
                r: { value: 6371000.0, unit: "m", name: "Distancia (Radio Tierra)" }
            },
            perturbations: [
                { name: "Longitud: metros -> milímetros (r en mm)", targetUnits: { r: "mm" } },
                { name: "Masa: kilogramos -> gramos (m2 en g)", targetUnits: { m2: "g" } },
                { name: "Masa: kilogramos -> libras (m2 en lb)", targetUnits: { m2: "lb" } }
            ]
        },
        bernoulli_buggy: {
            title: "Presión Dinámica de Bernoulli (Confusión km/h con m/s)",
            code: `// Presión dinámica q = 0.5 * rho * v^2
function presionDinamica(rho, v) {
    // BUG: Asume que la velocidad v viene en m/s sin comprobar!
    const q = 0.5 * rho.value * (v.value ** 2);
    return { dynamic_pressure: { value: q, unit: "Pa" } };
}`,
            fn: (inputs) => {
                const q = 0.5 * inputs.rho.value * (inputs.v.value ** 2);
                return { dynamic_pressure: { value: q, unit: "Pa" } };
            },
            inputs: {
                rho: { value: 1.204, unit: "kg/m^3", name: "Densidad aire" },
                v: { value: 27.78, unit: "m/s", name: "Velocidad (100 km/h)" }
            },
            perturbations: [
                { name: "Velocidad: m/s -> km/h (v en km/h)", targetUnits: { v: "km/h" } },
                { name: "Velocidad: m/s -> nudos (v en knot)", targetUnits: { v: "knot" } }
            ]
        }
    };

    function updateModel() {
        const mKey = selectModel.value;
        const model = MODELS[mKey];
        if (!model) return;
        codeDisplay.textContent = model.code;
    }

    selectModel.addEventListener('change', updateModel);
    updateModel();

    btnRunMeta.addEventListener('click', () => {
        const mKey = selectModel.value;
        const model = MODELS[mKey];
        if (!model) return;

        const res = MetamorphicTester.testModel(model.fn, model.inputs, model.perturbations);
        let html = `
            <div class="meta-report-header">
                <h4><i class="fas fa-vial"></i> Resultados de Metamorphic Probing</h4>
                <p>Salida base del modelo: <strong>${res.baseOutput.force ? res.baseOutput.force.value.toFixed(2) + ' N' : res.baseOutput.dynamic_pressure.value.toFixed(2) + ' Pa'}</strong></p>
            </div>
            <div class="meta-cases-grid">
        `;

        res.results.forEach(r => {
            const isPass = r.passed;
            const badgeClass = isPass ? "meta-pass" : "meta-fail";
            const icon = isPass ? "fa-check-circle" : "fa-times-circle";

            html += `
                <div class="meta-case-card ${badgeClass}">
                    <div class="meta-case-title">
                        <i class="fas ${icon}"></i> <strong>${r.name}</strong>
                        <span class="meta-tag ${badgeClass}">${isPass ? 'INVARIANTE (PASÓ)' : 'FALLÓ INVARIANZA'}</span>
                    </div>
                    <p class="meta-msg">${r.message}</p>
            `;

            if (r.comparison) {
                html += `<div class="meta-comp-details">`;
                for (const [k, comp] of Object.entries(r.comparison)) {
                    html += `
                        <div class="comp-row">
                            <span>Valor base en SI: <strong>${comp.baseVal.toExponential(4)}</strong></span>
                            <span>Valor tras perturbar: <strong>${comp.pertVal.toExponential(4)}</strong></span>
                            <span>Error relativo: <strong>${(comp.relError * 100).toFixed(2)}%</strong></span>
                        </div>
                    `;
                }
                html += `</div>`;
            }

            html += `</div>`;
        });

        html += `</div>`;
        resultsContainer.innerHTML = html;
    });

    // Run initial test
    btnRunMeta.click();
}

/* =========================================================================
   CATÁLOGO DE REGLAS DE PLAUSIBILIDAD
   ========================================================================= */
function initRulesCatalog() {
    const container = document.getElementById('rules-catalog-cards');
    if (!container) return;

    let html = '';
    SANITY_RULES_CATALOG.forEach(r => {
        html += `
            <div class="rule-catalog-card">
                <div class="rule-cat-header">
                    <span class="rule-id-pill">${r.id}</span>
                    <span class="rule-domain-tag">${r.domain}</span>
                </div>
                <h4 class="rule-title">${r.name}</h4>
                <p class="rule-desc">${r.description}</p>
                <div class="rule-law-box"><i class="fas fa-balance-scale"></i> <strong>Principio Físico:</strong> ${r.physicalLaw}</div>
                <div class="rule-causes-list">
                    <strong>Causas Frecuentes Detectadas:</strong>
                    <ul>
                        ${r.possibleCauses.map(c => `<li>${c}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

/* =========================================================================
   COMPENDIO DE ESCALAS DE REFERENCIA
   ========================================================================= */
function initScalesCatalog() {
    const container = document.getElementById('scales-catalog-container');
    if (!container) return;

    let html = '';
    for (const [domainKey, domain] of Object.entries(REFERENCE_SCALES)) {
        html += `
            <div class="scales-domain-section">
                <h3 class="domain-title"><i class="fas fa-layer-group"></i> ${domain.name}</h3>
                <div class="scales-grid">
        `;

        for (const [sKey, s] of Object.entries(domain.scales)) {
            html += `
                <div class="scale-card">
                    <div class="scale-key"><code>${sKey}</code></div>
                    <div class="scale-val">${s.value.toLocaleString()} <span class="unit-text">${s.unit}</span></div>
                    <div class="scale-desc">${s.desc}</div>
                    <div class="scale-source text-dim"><i class="fas fa-book"></i> Fuente: ${s.source}</div>
                </div>
            `;
        }

        html += `
                </div>
            </div>
        `;
    }
    container.innerHTML = html;
}

/* =========================================================================
   TERMINAL CLI INTERACTIVO
   ========================================================================= */
function initTerminal() {
    const input = document.getElementById('terminal-input');
    const output = document.getElementById('terminal-output');
    const history = [];
    let historyIdx = -1;

    printToTerminal("physics-sanity-check CLI Web Terminal Simulator [v2.1.0]", "term-header");
    printToTerminal("Escribí 'help' para ver los comandos disponibles o 'demo' para ejecutar una inspección guiada.", "term-muted");
    printToTerminal("");

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const cmd = input.value.trim();
            if (cmd) {
                history.push(cmd);
                historyIdx = history.length;
                printToTerminal(`$ psc ${cmd}`, "term-cmd");
                executeCommand(cmd);
                input.value = '';
            }
        } else if (e.key === 'ArrowUp') {
            if (historyIdx > 0) {
                historyIdx--;
                input.value = history[historyIdx];
            }
        } else if (e.key === 'ArrowDown') {
            if (historyIdx < history.length - 1) {
                historyIdx++;
                input.value = history[historyIdx];
            } else {
                historyIdx = history.length;
                input.value = '';
            }
        }
    });

    function printToTerminal(text, className = "term-line") {
        const line = document.createElement('div');
        line.className = className;
        line.textContent = text;
        output.appendChild(line);
        output.scrollTop = output.scrollHeight;
    }

    function executeCommand(fullCmd) {
        const parts = fullCmd.split(' ').map(s => s.trim()).filter(s => s.length > 0);
        const cmd = parts[0];
        const args = parts.slice(1);

        switch (cmd) {
            case 'help':
                printToTerminal("Comandos disponibles en psc CLI:");
                printToTerminal("  check <case_id>       Ejecuta el chequeo de plausibilidad sobre un caso (ej: check case_efficiency_pump)");
                printToTerminal("  cases                 Lista todos los casos curados de prueba disponibles");
                printToTerminal("  scales [dominio]      Muestra las escalas de referencia (astrophysics, fluids, human, materials)");
                printToTerminal("  probe                 Ejecuta la suite de metamorphic testing sobre modelos");
                printToTerminal("  demo                  Ejecuta una demostración interactiva guiada");
                printToTerminal("  clear                 Limpia la pantalla de la terminal");
                break;

            case 'clear':
                output.innerHTML = '';
                break;

            case 'cases':
                printToTerminal("Casos curados de prueba disponibles:");
                CURATED_SANITY_CASES.forEach(c => {
                    printToTerminal(`  - ${c.id.padEnd(28)} : ${c.title}`);
                });
                break;

            case 'check':
                const cId = args[0] || 'case_efficiency_pump';
                const found = CURATED_SANITY_CASES.find(c => c.id === cId || c.id.includes(cId));
                if (!found) {
                    printToTerminal(`Error: Caso '${cId}' no encontrado. Usá 'cases' para listar.`, "term-error");
                    return;
                }
                printToTerminal(`Cargando caso: ${found.title}...`, "term-info");
                const rep = sanityEngine.evaluateCase({ domain: found.domain, system: found.system, model: found.model }, found.quantities);
                printToTerminal(`Resultados: FAIL=${rep.summary.FAIL}, WARNING=${rep.summary.WARNING}, SUSPICIOUS=${rep.summary.SUSPICIOUS}, PASS=${rep.summary.PASS}`);
                rep.results.forEach(r => {
                    if (r.severity === 'FAIL') printToTerminal(`[FAIL] ${r.ruleId}: ${r.message}`, "term-error");
                    else if (r.severity === 'WARNING') printToTerminal(`[WARN] ${r.ruleId}: ${r.message}`, "term-warning");
                    else if (r.severity === 'SUSPICIOUS') printToTerminal(`[SUSP] ${r.ruleId}: ${r.message}`, "term-warning");
                    else printToTerminal(`[PASS] ${r.ruleId}: ${r.message}`, "term-success");
                });
                break;

            case 'scales':
                const dom = args[0] || 'fluids';
                const d = REFERENCE_SCALES[dom];
                if (!d) {
                    printToTerminal(`Dominio '${dom}' no encontrado. Opciones: astrophysics, human, fluids, materials, thermodynamics`, "term-error");
                    return;
                }
                printToTerminal(`Escalas de referencia para: ${d.name}`);
                for (const [k, s] of Object.entries(d.scales)) {
                    printToTerminal(`  ${k.padEnd(25)} = ${s.value} ${s.unit} (${s.desc})`);
                }
                break;

            case 'probe':
                printToTerminal("Ejecutando Metamorphic Probing en modelo de gravedad con constantes hardcodeadas...");
                printToTerminal("Perturbación: m a mm -> Falla invarianza. Resultado alterado en factor 10^6.", "term-error");
                printToTerminal("Detectado: constante G asume unidades implícitas de metros y kilogramos.", "term-warning");
                break;

            case 'demo':
                runDemo();
                break;

            default:
                printToTerminal(`Comando no reconocido: '${cmd}'. Escribí 'help' para ver la lista.`, "term-error");
                break;
        }
        printToTerminal("");
    }

    function runDemo() {
        printToTerminal("=== EJECUTANDO DEMOSTRACIÓN GUIADA DE PHYSICS SANITY CHECK ===", "term-header");
        setTimeout(() => {
            printToTerminal("\n1. Chequeo de caso: Bomba con rendimiento > 100%");
            executeCommand("check case_efficiency_pump");
        }, 600);
        setTimeout(() => {
            printToTerminal("\n2. Chequeo de caso: Línea de succión con presión absoluta negativa");
            executeCommand("check case_negative_pressure");
        }, 1400);
        setTimeout(() => {
            printToTerminal("\n3. Chequeo de caso: Velocidad transónica bajo modelo incompresible");
            executeCommand("check case_transonic_incompressible");
        }, 2200);
    }
}

/* =========================================================================
   TOAST NOTIFICATIONS
   ========================================================================= */
function showToast(message, type = "info") {
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;
    const icon = type === 'success' ? 'fa-check-circle' : (type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle');
    toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;

    toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

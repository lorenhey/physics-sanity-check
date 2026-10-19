/**
 * physics-sanity-check - Renderizador de escala logarítmica interactiva
 * Loren Hey - Antigravity
 */

class LogScaleRenderer {
    static renderLogScale(containerId, value, unit, referenceScale, title = "") {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (value <= 0 || !referenceScale || referenceScale.value <= 0) {
            container.innerHTML = "";
            return;
        }

        const logVal = Math.log10(value);
        const logRef = Math.log10(referenceScale.value);
        const logDiff = logVal - logRef;

        // Choose range around reference: ref - 5 to ref + 5
        const minExp = Math.floor(Math.min(logVal, logRef)) - 1;
        const maxExp = Math.ceil(Math.max(logVal, logRef)) + 1;
        const range = maxExp - minExp || 1;

        const valPercent = Math.max(0, Math.min(100, ((logVal - minExp) / range) * 100));
        const refPercent = Math.max(0, Math.min(100, ((logRef - minExp) / range) * 100));

        let html = `
            <div class="log-scale-card">
                <div class="log-scale-header">
                    <span class="log-scale-title"><i class="fas fa-ruler-horizontal"></i> ${title || 'Comparativa de Órdenes de Magnitud en Escala Logarítmica'}</span>
                    <span class="log-scale-diff">Desviación: <strong>10<sup>${logDiff >= 0 ? '+' : ''}${logDiff.toFixed(1)}</sup></strong></span>
                </div>
                
                <div class="log-scale-axis-wrapper">
                    <div class="log-scale-axis">
                        <!-- Reference Marker -->
                        <div class="log-scale-marker ref-marker" style="left: ${refPercent.toFixed(1)}%;">
                            <div class="marker-pin"></div>
                            <div class="marker-label">Referencia: ${referenceScale.value.toLocaleString()} ${unit}</div>
                        </div>

                        <!-- Current Value Marker -->
                        <div class="log-scale-marker val-marker" style="left: ${valPercent.toFixed(1)}%;">
                            <div class="marker-pin"></div>
                            <div class="marker-label">Calculado: ${value.toLocaleString()} ${unit}</div>
                        </div>
                    </div>

                    <!-- Axis Ticks -->
                    <div class="log-scale-ticks">
        `;

        for (let exp = minExp; exp <= maxExp; exp += Math.max(1, Math.round(range / 6))) {
            const tickPercent = ((exp - minExp) / range) * 100;
            html += `
                <div class="log-scale-tick" style="left: ${tickPercent.toFixed(1)}%;">
                    <div class="tick-line"></div>
                    <div class="tick-label">10<sup>${exp}</sup></div>
                </div>
            `;
        }

        html += `
                    </div>
                </div>
                <div class="log-scale-footer">
                    <span>${referenceScale.desc || ''}</span>
                    <span>Fuente: ${referenceScale.source || 'Estándar'}</span>
                </div>
            </div>
        `;

        container.innerHTML = html;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LogScaleRenderer };
}

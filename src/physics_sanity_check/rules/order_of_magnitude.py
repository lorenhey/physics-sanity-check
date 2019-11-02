import math
from typing import Dict
from .base import Rule, RuleResult
from ..core.types import Context, Severity
from ..core.quantity import PhysQuantity
from .scales import REFERENCE_SCALES

class OrderOfMagnitudeRule(Rule):
    @property
    def id(self) -> str:
        return "OOM-CHECK-001"

    @property
    def description(self) -> str:
        return "Checks values against known reference scales via log10 comparison"

    def evaluate(self, ctx: Context, quantities: Dict[str, PhysQuantity]) -> RuleResult:
        if not ctx.system:
            return RuleResult(rule_id=self.id, severity=Severity.PASS, message="No reference system provided.", context_data={})

        domain_scales = REFERENCE_SCALES.get(ctx.domain, {})
        system_prefix = f"{ctx.system}_"

        for name, q in quantities.items():
            # Try to find a matching reference scale
            scale_key = f"{system_prefix}{name}" if ctx.system else name
            
            # fallback if name matches directly
            if scale_key not in domain_scales and name in domain_scales:
                scale_key = name
                
            if scale_key in domain_scales:
                ref = domain_scales[scale_key]
                ref_q = q.from_string(f"{ref.value} {ref.unit}", q.metadata)
                
                # Check if dimensions match
                if q.dimensionality != ref_q.dimensionality:
                    return RuleResult(
                        rule_id=self.id,
                        severity=Severity.FAIL,
                        message=f"Dimensionality mismatch for {name}: {q.dimensionality} vs ref {ref_q.dimensionality}",
                        context_data={}
                    )
                
                # Convert to same unit for direct comparison
                q_in_ref_unit = q.to(ref.unit)
                
                if q_in_ref_unit.value <= 0 or ref.value <= 0:
                    continue # Cannot compute log10 for <= 0
                    
                log_diff = math.log10(q_in_ref_unit.value / ref.value)
                
                if abs(log_diff) >= 2:
                    severity = Severity.SUSPICIOUS if abs(log_diff) < 3 else Severity.WARNING
                    return RuleResult(
                        rule_id=self.id,
                        severity=severity,
                        message=f"Value for {name} ({q_in_ref_unit.value:.3g} {ref.unit}) is ~10^{int(round(log_diff))} times the reference scale for {ctx.system or ctx.domain} ({ref.value} {ref.unit}).",
                        context_data={"log_diff": log_diff, "ref_value": ref.value, "ref_unit": ref.unit},
                        possible_causes=[
                            "Wrong units (e.g. m/s vs km/s or mm vs m)",
                            "Factor of 1000 error",
                            "Model assumptions heavily violated"
                        ]
                    )

        return RuleResult(rule_id=self.id, severity=Severity.PASS, message="OOM checks passed.", context_data={})

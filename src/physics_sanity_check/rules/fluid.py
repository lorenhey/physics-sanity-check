from typing import Dict
from .base import Rule, RuleResult
from ..core.types import Context, Severity
from ..core.quantity import PhysQuantity

class LowMachIncompressibleRule(Rule):
    @property
    def id(self) -> str:
        return "FLUID-INCOMPRESSIBLE-MACH"

    @property
    def description(self) -> str:
        return "Checks if Mach number is too high for incompressible flow assumption"

    @property
    def domain(self) -> str:
        return "fluid_mechanics"

    def evaluate(self, ctx: Context, quantities: Dict[str, PhysQuantity]) -> RuleResult:
        if ctx.model != "incompressible":
            return RuleResult(rule_id=self.id, severity=Severity.PASS, message="Model is not incompressible.", context_data={})
            
        mach = None
        # Try to find Mach number explicitly
        for name, q in quantities.items():
            if "mach" in name.lower():
                mach = q.to("").value
                break
                
        # Calculate from velocity and sound speed if available
        if mach is None and "velocity" in quantities and "sound_speed" in quantities:
            v = quantities["velocity"].to("m/s").value
            c = quantities["sound_speed"].to("m/s").value
            if c > 0:
                mach = v / c
                
        if mach is not None:
            # Configurable threshold, default 0.3
            threshold = float(ctx.metadata.get("mach_threshold", 0.3))
            
            if mach > threshold:
                return RuleResult(
                    rule_id=self.id,
                    severity=Severity.WARNING,
                    message=f"Low-Mach assumption may be invalid. Mach: {mach:.3g} > threshold {threshold}",
                    context_data={"mach": mach, "threshold": threshold},
                    possible_causes=[
                        "Using incompressible model for compressible regime",
                        "Sound speed is too low for the medium"
                    ]
                )
                
        return RuleResult(rule_id=self.id, severity=Severity.PASS, message="Mach number within incompressible bounds or not calculable.", context_data={})

class AbsolutePressurePositivityRule(Rule):
    @property
    def id(self) -> str:
        return "FLUID-ABS-PRESSURE-POSITIVITY"

    @property
    def description(self) -> str:
        return "Checks if absolute pressure is >= 0"

    def evaluate(self, ctx: Context, quantities: Dict[str, PhysQuantity]) -> RuleResult:
        for name, q in quantities.items():
            if q.metadata.is_absolute and ("pressure" in name.lower() or q.metadata.phys_type == "absolute_pressure"):
                try:
                    val = q.to("Pa").value
                    if val < 0:
                        return RuleResult(
                            rule_id=self.id,
                            severity=Severity.FAIL,
                            message=f"Absolute pressure {name} cannot be negative: {val:.3g} Pa",
                            context_data={"value": val},
                            possible_causes=[
                                "Gauge pressure confused with absolute",
                                "Numerical divergence",
                                "Model outside validity"
                            ]
                        )
                except Exception:
                    pass
                    
        return RuleResult(rule_id=self.id, severity=Severity.PASS, message="All absolute pressures are >= 0.", context_data={})

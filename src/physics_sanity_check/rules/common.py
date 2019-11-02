from typing import Dict
from .base import Rule, RuleResult
from ..core.types import Context, Severity, PhysType
from ..core.quantity import PhysQuantity

class EfficiencyBoundsRule(Rule):
    @property
    def id(self) -> str:
        return "COMMON-EFFICIENCY-BOUNDS"

    @property
    def description(self) -> str:
        return "Checks if efficiency is between 0 and 1"

    def evaluate(self, ctx: Context, quantities: Dict[str, PhysQuantity]) -> RuleResult:
        for name, q in quantities.items():
            if q.metadata.phys_type == PhysType.EFFICIENCY:
                val = q.to("").value
                if val < 0 or val > 1:
                    return RuleResult(
                        rule_id=self.id,
                        severity=Severity.FAIL,
                        message=f"Efficiency {name} is out of physical bounds [0, 1]: {val}",
                        context_data={"value": val},
                        possible_causes=[
                            "COP confused with efficiency",
                            "Percentage used instead of ratio (e.g. 80 instead of 0.8)",
                            "Input and output powers swapped"
                        ]
                    )
        return RuleResult(rule_id=self.id, severity=Severity.PASS, message="All efficiencies are in bounds.", context_data={})

class AbsoluteTemperaturePositivityRule(Rule):
    @property
    def id(self) -> str:
        return "COMMON-ABS-TEMP-POSITIVITY"

    @property
    def description(self) -> str:
        return "Checks if absolute temperatures are >= 0 K"

    def evaluate(self, ctx: Context, quantities: Dict[str, PhysQuantity]) -> RuleResult:
        for name, q in quantities.items():
            if q.metadata.phys_type == PhysType.ABSOLUTE_TEMPERATURE:
                val = q.to("kelvin").value
                if val < 0:
                    return RuleResult(
                        rule_id=self.id,
                        severity=Severity.FAIL,
                        message=f"Absolute temperature {name} cannot be negative: {val} K",
                        context_data={"value": val},
                        possible_causes=[
                            "Gauge/relative temperature (°C) used instead of absolute (K)",
                            "Numerical error in equation"
                        ]
                    )
        return RuleResult(rule_id=self.id, severity=Severity.PASS, message="All absolute temperatures are >= 0 K.", context_data={})

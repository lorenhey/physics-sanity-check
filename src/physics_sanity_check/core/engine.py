from typing import Dict, List, Optional
from pydantic import BaseModel
from .types import Context, Severity
from .quantity import PhysQuantity
from ..rules.base import Rule, RuleResult

class SanityReport(BaseModel):
    results: List[RuleResult]
    
    def summary(self) -> Dict[Severity, int]:
        counts = {sev: 0 for sev in Severity}
        for r in self.results:
            counts[r.severity] += 1
        return counts

class RuleEngine:
    def __init__(self):
        self._rules: List[Rule] = []

    def register_rule(self, rule: Rule):
        self._rules.append(rule)

    def check(self, ctx: Context, quantities: Dict[str, PhysQuantity]) -> SanityReport:
        results = []
        for rule in self._rules:
            # Optionally filter rules based on context
            if rule.domain and ctx.domain and rule.domain != ctx.domain:
                continue
                
            res = rule.evaluate(ctx, quantities)
            if res.severity != Severity.PASS:
                results.append(res)
            elif res.severity == Severity.PASS: # Always append for debugging? For now, yes.
                 results.append(res)

        return SanityReport(results=results)

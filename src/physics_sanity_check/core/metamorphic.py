from typing import Callable, Dict, Any, List
from .quantity import PhysQuantity
from .types import Severity
from ..rules.base import RuleResult
import copy

class MetamorphicTest:
    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description
        
    def generate_inputs(self, base_inputs: Dict[str, PhysQuantity]) -> Dict[str, PhysQuantity]:
        raise NotImplementedError
        
    def evaluate(self, base_outputs: Dict[str, PhysQuantity], test_outputs: Dict[str, PhysQuantity]) -> RuleResult:
        raise NotImplementedError

class UnitRoundtripTest(MetamorphicTest):
    def __init__(self, target_units: Dict[str, str]):
        super().__init__("Unit Roundtrip", "Changes units of inputs and checks if outputs are equivalent.")
        self.target_units = target_units
        
    def generate_inputs(self, base_inputs: Dict[str, PhysQuantity]) -> Dict[str, PhysQuantity]:
        new_inputs = {}
        for name, q in base_inputs.items():
            if name in self.target_units:
                new_inputs[name] = q.to(self.target_units[name])
            else:
                new_inputs[name] = copy.deepcopy(q)
        return new_inputs
        
    def evaluate(self, base_outputs: Dict[str, PhysQuantity], test_outputs: Dict[str, PhysQuantity]) -> RuleResult:
        for name, base_q in base_outputs.items():
            if name not in test_outputs:
                continue
            test_q = test_outputs[name]
            
            # Check if equivalent
            try:
                base_val = base_q.to_base_units().value
                test_val = test_q.to_base_units().value
                
                # Tolerant float comparison
                if abs(base_val - test_val) > 1e-6 * (abs(base_val) + 1e-9):
                    return RuleResult(
                        rule_id="METAMORPHIC-UNIT-ROUNDTRIP",
                        severity=Severity.FAIL,
                        message=f"Output {name} changed under unit roundtrip: {base_q} != {test_q} ({base_val} != {test_val})",
                        context_data={"base_val": base_val, "test_val": test_val},
                        possible_causes=["Hardcoded constant assuming specific units", "Missing unit conversion in model"]
                    )
            except Exception as e:
                 return RuleResult(
                     rule_id="METAMORPHIC-UNIT-ROUNDTRIP",
                     severity=Severity.FAIL,
                     message=f"Error evaluating equivalence for {name}: {str(e)}",
                     context_data={}
                 )
                 
        return RuleResult(
            rule_id="METAMORPHIC-UNIT-ROUNDTRIP",
            severity=Severity.PASS,
            message="Unit roundtrip metamorphic test passed.",
            context_data={}
        )

def run_metamorphic_suite(model: Callable, base_inputs: Dict[str, PhysQuantity], tests: List[MetamorphicTest]) -> List[RuleResult]:
    try:
        base_outputs = model(**base_inputs)
    except Exception as e:
        return [RuleResult(rule_id="META-BASE-FAIL", severity=Severity.NOT_EVALUABLE, message=f"Base model failed: {e}", context_data={})]
        
    results = []
    for test in tests:
        test_inputs = test.generate_inputs(base_inputs)
        try:
            test_outputs = model(**test_inputs)
            res = test.evaluate(base_outputs, test_outputs)
            results.append(res)
        except Exception as e:
            results.append(RuleResult(
                rule_id=f"META-{test.name}-FAIL", 
                severity=Severity.FAIL, 
                message=f"Model failed under metamorphic transformation '{test.name}': {e}", 
                context_data={}
            ))
            
    return results

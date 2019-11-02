import pytest
from physics_sanity_check.core.quantity import PhysQuantity
from physics_sanity_check.core.types import QuantityMetadata, PhysType, Context, Severity
from physics_sanity_check.rules.common import EfficiencyBoundsRule, AbsoluteTemperaturePositivityRule

def test_efficiency_bounds():
    rule = EfficiencyBoundsRule()
    ctx = Context()
    
    # Valid
    q_valid = PhysQuantity(0.8, "", QuantityMetadata(name="eff1", phys_type=PhysType.EFFICIENCY))
    res = rule.evaluate(ctx, {"eff": q_valid})
    assert res.severity == Severity.PASS
    
    # Invalid (e.g. 1.2)
    q_invalid = PhysQuantity(1.2, "", QuantityMetadata(name="eff2", phys_type=PhysType.EFFICIENCY))
    res = rule.evaluate(ctx, {"eff": q_invalid})
    assert res.severity == Severity.FAIL
    assert "out of physical bounds" in res.message

def test_absolute_temperature_positivity():
    rule = AbsoluteTemperaturePositivityRule()
    ctx = Context()
    
    # Valid
    q_valid = PhysQuantity(300, "K", QuantityMetadata(name="t1", phys_type=PhysType.ABSOLUTE_TEMPERATURE))
    res = rule.evaluate(ctx, {"t": q_valid})
    assert res.severity == Severity.PASS
    
    # Invalid
    q_invalid = PhysQuantity(-10, "K", QuantityMetadata(name="t2", phys_type=PhysType.ABSOLUTE_TEMPERATURE))
    res = rule.evaluate(ctx, {"t": q_invalid})
    assert res.severity == Severity.FAIL
    
    # Valid but in Celsius (e.g. 10 degC = 283.15 K)
    q_c_valid = PhysQuantity(10, "degC", QuantityMetadata(name="t3", phys_type=PhysType.ABSOLUTE_TEMPERATURE))
    res = rule.evaluate(ctx, {"t": q_c_valid})
    assert res.severity == Severity.PASS
    
    # Invalid in Celsius (e.g. -300 degC = -26.85 K)
    q_c_invalid = PhysQuantity(-300, "degC", QuantityMetadata(name="t4", phys_type=PhysType.ABSOLUTE_TEMPERATURE))
    res = rule.evaluate(ctx, {"t": q_c_invalid})
    assert res.severity == Severity.FAIL

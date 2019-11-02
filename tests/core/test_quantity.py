import pytest
from physics_sanity_check.core.quantity import PhysQuantity
from physics_sanity_check.core.types import QuantityMetadata, PhysType

def test_quantity_conversion():
    meta = QuantityMetadata(name="test", phys_type=PhysType.GENERIC)
    q = PhysQuantity(1.0, "km", meta)
    
    assert q.value == 1.0
    assert q.unit == "kilometer"
    
    q_m = q.to("m")
    assert q_m.value == 1000.0
    assert q_m.unit == "meter"

def test_quantity_base_units():
    meta = QuantityMetadata(name="test", phys_type=PhysType.GENERIC)
    q = PhysQuantity(1.0, "N", meta)
    
    q_base = q.to_base_units()
    assert q_base.unit == "kilogram * meter / second ** 2"
    assert q_base.value == 1.0

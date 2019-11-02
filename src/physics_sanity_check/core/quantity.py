import pint
from typing import Any, Optional
from .types import QuantityMetadata, PhysType

# Setup pint registry
ureg = pint.UnitRegistry()

class PhysQuantity:
    def __init__(self, value: float | int, unit: str, metadata: QuantityMetadata):
        self._q = ureg.Quantity(value, unit)
        self.metadata = metadata

    @property
    def value(self) -> float:
        return self._q.m

    @property
    def unit(self) -> str:
        return str(self._q.u)
        
    @property
    def dimensionality(self) -> pint.util.UnitsContainer:
        return self._q.dimensionality

    @classmethod
    def from_string(cls, value_str: str, metadata: QuantityMetadata):
        q = ureg.Quantity(value_str)
        return cls(q.m, str(q.u), metadata)

    def to(self, unit: str) -> "PhysQuantity":
        converted = self._q.to(unit)
        return PhysQuantity(converted.m, str(converted.u), self.metadata)
        
    def to_base_units(self) -> "PhysQuantity":
        converted = self._q.to_base_units()
        return PhysQuantity(converted.m, str(converted.u), self.metadata)

    def __repr__(self) -> str:
        return f"PhysQuantity({self.value} {self.unit}, type={self.metadata.phys_type.value})"

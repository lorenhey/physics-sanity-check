import enum
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field

class Severity(str, enum.Enum):
    PASS = "PASS"
    INFO = "INFO"
    SUSPICIOUS = "SUSPICIOUS"
    WARNING = "WARNING"
    FAIL = "FAIL"
    NOT_EVALUABLE = "NOT_EVALUABLE"

class PhysType(str, enum.Enum):
    ABSOLUTE_TEMPERATURE = "absolute_temperature"
    TEMPERATURE_DIFFERENCE = "temperature_difference"
    ABSOLUTE_PRESSURE = "absolute_pressure"
    GAUGE_PRESSURE = "gauge_pressure"
    PRESSURE_DIFFERENCE = "pressure_difference"
    DIAMETER = "diameter"
    RADIUS = "radius"
    FREQUENCY = "frequency"
    ANGULAR_FREQUENCY = "angular_frequency"
    EFFICIENCY = "efficiency"
    MASS_FRACTION = "mass_fraction"
    PROBABILITY = "probability"
    COEFFICIENT = "coefficient"
    SPECIFIC_ENERGY = "specific_energy"
    TOTAL_ENERGY = "total_energy"
    GENERIC = "generic"

class Context(BaseModel):
    domain: Optional[str] = None
    system: Optional[str] = None
    model: Optional[str] = None
    assumptions: List[str] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
class QuantityMetadata(BaseModel):
    name: str
    phys_type: PhysType = PhysType.GENERIC
    description: Optional[str] = None
    source: Optional[str] = None
    is_gauge: bool = False
    is_absolute: bool = True
    is_difference: bool = False

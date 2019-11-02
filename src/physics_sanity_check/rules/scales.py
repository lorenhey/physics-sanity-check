from pydantic import BaseModel
from typing import Dict, Optional, Tuple

class ReferenceScale(BaseModel):
    value: float
    unit: str
    description: str
    source: str
    valid_range: Optional[Tuple[float, float]] = None
    
# Common reference objects
REFERENCE_SCALES: Dict[str, Dict[str, ReferenceScale]] = {
    "astrophysics": {
        "earth_radius": ReferenceScale(
            value=6371000,
            unit="m",
            description="Mean radius of Earth",
            source="NASA"
        ),
        "earth_mass": ReferenceScale(
            value=5.972e24,
            unit="kg",
            description="Mass of Earth",
            source="NASA"
        ),
        "earth_escape_velocity": ReferenceScale(
            value=11186,
            unit="m/s",
            description="Escape velocity from Earth surface",
            source="NASA"
        )
    },
    "human": {
        "walking_speed": ReferenceScale(
            value=1.4,
            unit="m/s",
            description="Average human walking speed",
            source="General"
        ),
        "room_temperature": ReferenceScale(
            value=293.15,
            unit="K",
            description="Typical room temperature",
            valid_range=(288, 303),
            source="General"
        )
    }
}

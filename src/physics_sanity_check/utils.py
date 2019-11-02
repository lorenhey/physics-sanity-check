import yaml
from pathlib import Path
from typing import Dict, Any, Tuple
from .core.types import Context, QuantityMetadata, PhysType
from .core.quantity import PhysQuantity

def load_case_from_yaml(filepath: str) -> Tuple[Context, Dict[str, PhysQuantity]]:
    with open(filepath, 'r', encoding='utf-8') as f:
        data = yaml.safe_load(f)

    ctx_data = data.get("context", {})
    ctx = Context(**ctx_data)

    quantities = {}
    quants_data = data.get("quantities", {})
    for q_name, q_data in quants_data.items():
        meta = QuantityMetadata(
            name=q_name,
            phys_type=PhysType(q_data.get("phys_type", "generic")),
            description=q_data.get("description"),
            is_gauge=q_data.get("is_gauge", False),
            is_absolute=q_data.get("is_absolute", True)
        )
        q = PhysQuantity(q_data["value"], q_data["unit"], meta)
        quantities[q_name] = q

    return ctx, quantities

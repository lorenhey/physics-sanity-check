from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Any
from ..core.types import Context, Severity
from ..core.quantity import PhysQuantity
from pydantic import BaseModel

class RuleResult(BaseModel):
    rule_id: str
    severity: Severity
    message: str
    context_data: Dict[str, Any]
    possible_causes: List[str] = []

class Rule(ABC):
    @property
    @abstractmethod
    def id(self) -> str:
        pass

    @property
    @abstractmethod
    def description(self) -> str:
        pass

    @property
    def domain(self) -> Optional[str]:
        return None

    @abstractmethod
    def evaluate(self, ctx: Context, quantities: Dict[str, PhysQuantity]) -> RuleResult:
        pass

from __future__ import annotations
from dataclasses import dataclass, asdict, field
from typing import Any

@dataclass(frozen=True)
class Document:
    id: str
    title: str
    type: str
    revision: str
    tags: list[str]
    content: str

@dataclass
class SourceHit:
    id: str
    title: str
    score: float
    snippet: str
    type: str
    revision: str

@dataclass
class QueryResult:
    question: str
    intent: str
    status: str
    answer: str
    citations: list[str]
    sources: list[SourceHit]
    unsupported_claims: list[str] = field(default_factory=list)
    approval_required: bool = False
    decision_pack: dict[str, Any] | None = None
    trace: list[dict[str, Any]] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        d=asdict(self)
        return d

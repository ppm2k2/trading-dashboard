from pydantic import BaseModel
from typing import Optional

class TickerUpdate(BaseModel):
    symbol: str
    bid: float
    last: float
    ask: float
    net: float
    pct: float
    volume: Optional[int] = 0
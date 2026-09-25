from datetime import datetime
from threading import Lock
from typing import Dict, Any, List

class InMemoryMarketCache:
    def __init__(self):
        self._lock = Lock()
        self._store: Dict[str, Dict[str, Any]] = {}
        self._history: Dict[str, List[float]] = {}

    def update_ticker(self, symbol: str, data: Dict[str, Any]) -> None:
        with self._lock:
            timestamp = datetime.utcnow().isoformat()
            self._store[symbol] = {**data, "updated_at": timestamp}
            
            if symbol not in self._history:
                self._history[symbol] = []
            
            self._history[symbol].append(data.get("last", 0.0))
            if len(self._history[symbol]) > 100:
                self._history[symbol].pop(0)

    def get_ticker(self, symbol: str) -> Dict[str, Any]:
        with self._lock:
            return self._store.get(symbol, {})

    def get_all(self) -> Dict[str, Dict[str, Any]]:
        with self._lock:
            return dict(self._store)

    def get_history(self, symbol: str) -> List[float]:
        with self._lock:
            return list(self._history.get(symbol, []))

market_cache = InMemoryMarketCache()
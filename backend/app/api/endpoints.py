from fastapi import APIRouter, Query
from app.cache.memory_cache import market_cache
from app.core.config import settings

try:
    from alpaca.data.historical import StockHistoricalDataClient
    from alpaca.data.requests import StockLatestQuoteRequest
except ImportError:
    StockHistoricalDataClient = None
    StockLatestQuoteRequest = None

router = APIRouter(prefix="/api/market", tags=["market"])

@router.get("/snapshot")
def get_market_snapshot(provider: str = Query(None)):
    active_provider = provider if provider else getattr(settings, "DATA_PROVIDER", "mock")

    if active_provider == "alpaca" and StockHistoricalDataClient and getattr(settings, "ALPACA_API_KEY", None):
        try:
            client = StockHistoricalDataClient(settings.ALPACA_API_KEY, settings.ALPACA_SECRET_KEY)
            symbols = ["INDU", "SPY", "QQQ", "DIA", "MSFT", "AAPL", "IWM"]
            request_params = StockLatestQuoteRequest(symbol_or_symbols=symbols)
            latest_quotes = client.get_stock_latest_quote(request_params)
            
            formatted_data = []
            for symbol in symbols:
                if symbol in latest_quotes:
                    quote = latest_quotes[symbol]
                    bid = float(quote.bid_price)
                    ask = float(quote.ask_price)
                    last = (bid + ask) / 2
                    formatted_data.append({
                        "symbol": symbol,
                        "bid": bid,
                        "last": last,
                        "ask": ask,
                        "net_change": 1.15,
                        "pct_change": 0.22
                    })
            if formatted_data:
                return formatted_data
        except Exception as e:
            print(f"Alpaca live fetch failed, falling back to mock cache: {e}")

    # Fallback to Mock Cache with safe key normalization
    raw_data = market_cache.get_all()
    formatted_data = []

    if isinstance(raw_data, list):
        for item in raw_data:
            last_val = float(item.get("last", item.get("price", 100.0)))
            formatted_data.append({
                "symbol": item.get("symbol", "UNKNOWN"),
                "bid": float(item.get("bid", last_val - 0.02)),
                "last": last_val,
                "ask": float(item.get("ask", last_val + 0.02)),
                "net_change": float(item.get("net_change", item.get("change", 1.45))),
                "pct_change": float(item.get("pct_change", item.get("percent_change", 0.38)))
            })
    elif isinstance(raw_data, dict):
        for sym, val in raw_data.items():
            last_val = float(val.get("last", val) if isinstance(val, dict) else val)
            formatted_data.append({
                "symbol": sym,
                "bid": last_val - 0.02,
                "last": last_val,
                "ask": last_val + 0.02,
                "net_change": 1.45,
                "pct_change": 0.38
            })

    return formatted_data

@router.get("/history/{symbol}")
def get_symbol_history(symbol: str):
    return {"symbol": symbol.upper(), "history": market_cache.get_history(symbol.upper())}
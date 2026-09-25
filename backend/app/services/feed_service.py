import asyncio
import random
from app.cache.memory_cache import market_cache

INITIAL_DATA = {
    'INDU': {'bid': 52496.58, 'last': 52496.60, 'ask': 52496.62, 'net': -321.90, 'pct': -0.61},
    'SPY': {'bid': 767.88, 'last': 767.96, 'ask': 768.05, 'net': -5.57, 'pct': -0.72},
    'QQQ': {'bid': 740.66, 'last': 740.68, 'ask': 740.70, 'net': -7.17, 'pct': -0.96},
    'DIA': {'bid': 514.69, 'last': 514.73, 'ask': 514.76, 'net': -2.88, 'pct': -0.56},
    'MSFT': {'bid': 499.88, 'last': 499.92, 'ask': 499.96, 'net': -4.38, 'pct': -0.87},
    'AAPL': {'bid': 336.91, 'last': 336.96, 'ask': 337.00, 'net': -3.54, 'pct': -1.04},
    'IWM': {'bid': 282.39, 'last': 282.40, 'ask': 282.41, 'net': -0.40, 'pct': -0.14}
}

def seed_cache():
    for sym, vals in INITIAL_DATA.items():
        market_cache.update_ticker(sym, vals)

async def run_market_simulation(broadcast_callback):
    symbols = list(INITIAL_DATA.keys())
    while True:
        await asyncio.sleep(1.0)
        sym = random.choice(symbols)
        current = market_cache.get_ticker(sym)
        if not current:
            continue
        
        delta = random.uniform(-0.5, 0.5)
        new_last = round(current['last'] + delta, 2)
        payload = {
            "symbol": sym,
            "bid": round(new_last - 0.02, 2),
            "last": new_last,
            "ask": round(new_last + 0.02, 2),
            "net": round(current['net'] + delta, 2),
            "pct": round(current['pct'] + (delta / 100), 2)
        }
        market_cache.update_ticker(sym, payload)
        await broadcast_callback({"type": "PRICE_UPDATE", "data": payload})
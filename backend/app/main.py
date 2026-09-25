from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import asyncio

from app.core.config import settings
from app.services.feed_service import seed_cache, run_market_simulation
from app.api.endpoints import router as api_router
from app.api.websockets import router as ws_router, manager

app = FastAPI(title=settings.app_name, version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)
app.include_router(ws_router)

@app.on_event("startup")
async def startup_event():
    seed_cache()
    asyncio.create_task(run_market_simulation(manager.broadcast))
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.auth import router as auth_router
from app.routers.restaurants import router as restaurant_router
from app.routers.categories import router as categories_router
from app.routers.menu_items import router as menu_items_router
from app.routers.dashboard import router as dashboard_router
from app.routers.restaurant_tables import (
    router as restaurant_tables_router,
)
from app.routers.public import router as public_router
from app.routers.orders import (
    public_router as public_orders_router,
    router as orders_router,
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(restaurant_router)
app.include_router(categories_router)
app.include_router(menu_items_router)
app.include_router(dashboard_router)
app.include_router(restaurant_tables_router)
app.include_router(public_router)
app.include_router(public_orders_router)
app.include_router(orders_router)

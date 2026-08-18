from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class RestaurantTableCreate(BaseModel):
    table_number: int
    name: Optional[str] = None


class RestaurantTableUpdate(BaseModel):
    table_number: Optional[int] = None
    name: Optional[str] = None
    is_active: Optional[bool] = None


class RestaurantTableResponse(BaseModel):
    id: int
    restaurant_id: int
    table_number: int
    name: Optional[str]
    public_token: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
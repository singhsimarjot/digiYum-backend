from pydantic import BaseModel
from typing import Optional


class PublicRestaurantResponse(BaseModel):
    id: int
    name: str


class PublicTableResponse(BaseModel):
    id: int
    table_number: int
    name: Optional[str]
    is_active: bool


class PublicTableInfoResponse(BaseModel):
    restaurant: PublicRestaurantResponse
    table: PublicTableResponse
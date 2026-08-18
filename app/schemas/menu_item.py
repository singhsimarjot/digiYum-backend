from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field


class MenuItemCreate(BaseModel):
    name: str
    description: str | None = None
    price: Decimal = Field(
        ...,
        max_digits=10,
        decimal_places=2,
    )
    image_url: str | None = None
    is_available: bool = True
    is_featured: bool = False
    sort_order: int = 0
    category_ids: list[int] = Field(default_factory=list)

class MenuItemUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    price: Decimal | None = Field(
        default=None,
        max_digits=10,
        decimal_places=2,
    )
    image_url: str | None = None
    is_available: bool | None = None
    is_featured: bool | None = None
    sort_order: int | None = None
    category_ids: list[int] | None = None


class MenuItemResponse(BaseModel):
    id: int
    restaurant_id: int
    name: str
    description: str | None
    price: Decimal
    image_url: str | None
    is_available: bool
    is_featured: bool
    sort_order: int
    category_ids: list[int]
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class RestaurantCreate(BaseModel):
    name: str

    description: Optional[str] = None
    logo_url: Optional[str] = None

    phone: Optional[str] = None
    email: Optional[str] = None

    address: Optional[str] = None
    city: Optional[str] = None
    province: Optional[str] = None
    postal_code: Optional[str] = None

    country: str = "Canada"
    currency: str = "CAD"
    timezone: str = "America/Toronto"

    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None


class RestaurantUpdate(BaseModel):
    name: Optional[str] = None

    description: Optional[str] = None
    logo_url: Optional[str] = None

    phone: Optional[str] = None
    email: Optional[str] = None

    address: Optional[str] = None
    city: Optional[str] = None
    province: Optional[str] = None
    postal_code: Optional[str] = None

    country: Optional[str] = None
    currency: Optional[str] = None
    timezone: Optional[str] = None

    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None


class RestaurantResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True
    )

    id: int
    name: str

    description: Optional[str] = None
    logo_url: Optional[str] = None

    phone: Optional[str] = None
    email: Optional[str] = None

    address: Optional[str] = None
    city: Optional[str] = None
    province: Optional[str] = None
    postal_code: Optional[str] = None

    country: str
    currency: str
    timezone: str

    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None

    is_active: bool

    created_at: datetime
    updated_at: datetime
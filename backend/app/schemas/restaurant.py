from datetime import datetime

from pydantic import BaseModel, ConfigDict


class RestaurantCreate(BaseModel):
    name: str
    slug: str
    description: str | None = None
    logo_url: str | None = None
    phone: str | None = None
    email: str | None = None
    address: str | None = None
    city: str | None = None
    province: str | None = None
    postal_code: str | None = None
    country: str = "Canada"
    currency: str = "CAD"
    timezone: str = "America/Toronto"
    primary_color: str | None = None
    secondary_color: str | None = None


class RestaurantResponse(BaseModel):
    id: int
    name: str
    slug: str
    description: str | None
    logo_url: str | None
    phone: str | None
    email: str | None
    address: str | None
    city: str | None
    province: str | None
    postal_code: str | None
    country: str
    currency: str
    timezone: str
    primary_color: str | None
    secondary_color: str | None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
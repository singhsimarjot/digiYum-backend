from datetime import datetime

from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field



# ============================================================
# CREATE ORDER ITEM
# ============================================================

class OrderItemCreate(BaseModel):
    menu_item_id: int = Field(..., gt=0)
    quantity: int = Field(..., gt=0)


class OrderStatus(str, Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    PREPARING = "PREPARING"
    READY = "READY"
    COMPLETED = "COMPLETED"
    REJECTED = "REJECTED"
    CANCELLED = "CANCELLED"

# ============================================================
# CREATE PUBLIC ORDER
# ============================================================

class PublicOrderCreate(BaseModel):
    public_token: str = Field(..., min_length=1)
    items: List[OrderItemCreate]

    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    notes: Optional[str] = None


# ============================================================
# ORDER ITEM RESPONSE
# ============================================================

class OrderItemResponse(BaseModel):
    id: int
    menu_item_id: Optional[int]
    name: str
    price: float
    quantity: int
    total: float

    class Config:
        orm_mode = True

# ============================================================
# ORDER RESPONSE
# ============================================================

class OrderResponse(BaseModel):
    id: int
    restaurant_id: int
    table_id: Optional[int]

    order_type: str
    status: OrderStatus

    customer_name: Optional[str]
    customer_phone: Optional[str]
    notes: Optional[str]

    subtotal: float
    tax: float
    total: float

    items: List[OrderItemResponse]

    class Config:
        orm_mode = True


class OrderStatusUpdate(BaseModel):
    status: OrderStatus
    rejection_reason: Optional[str] = None
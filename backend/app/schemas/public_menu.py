from typing import List, Optional

from pydantic import BaseModel


class PublicCategoryResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    image_url: Optional[str]
    sort_order: int
    is_active: bool


class PublicMenuItemResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    price: float
    image_url: Optional[str]
    is_available: bool
    is_featured: bool
    sort_order: int
    category_ids: List[int]
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db

from app.models.restaurant_table import RestaurantTable
from app.models.category import Category
from app.models.menu_item import MenuItem

from app.schemas.public_table import PublicTableInfoResponse
from app.schemas.public_menu import (
    PublicCategoryResponse,
    PublicMenuItemResponse,
)


router = APIRouter(
    prefix="/api/v1/public",
    tags=["Public"],
)


# ============================================================
# GET PUBLIC TABLE
# ============================================================

@router.get(
    "/tables/{public_token}",
    response_model=PublicTableInfoResponse,
)
def get_public_table(
    public_token: str,
    db: Session = Depends(get_db),
):
    table = (
        db.query(RestaurantTable)
        .filter(
            RestaurantTable.public_token == public_token,
            RestaurantTable.is_active == True,
        )
        .first()
    )

    if not table:
        raise HTTPException(
            status_code=404,
            detail="Table not found or inactive",
        )

    restaurant = table.restaurant

    if not restaurant:
        raise HTTPException(
            status_code=404,
            detail="Restaurant not found",
        )

    return {
        "restaurant": restaurant,
        "table": table,
    }


# ============================================================
# GET PUBLIC CATEGORIES
# ============================================================

@router.get(
    "/tables/{public_token}/categories",
    response_model=List[PublicCategoryResponse],
)
def get_public_categories(
    public_token: str,
    db: Session = Depends(get_db),
):
    # --------------------------------------------------------
    # Find active table
    # --------------------------------------------------------

    table = (
        db.query(RestaurantTable)
        .filter(
            RestaurantTable.public_token == public_token,
            RestaurantTable.is_active == True,
        )
        .first()
    )

    if not table:
        raise HTTPException(
            status_code=404,
            detail="Table not found or inactive",
        )

    # --------------------------------------------------------
    # Get active categories for this restaurant
    # --------------------------------------------------------

    categories = (
        db.query(Category)
        .filter(
            Category.restaurant_id == table.restaurant_id,
            Category.is_active == True,
        )
        .order_by(
            Category.sort_order.asc(),
            Category.id.asc(),
        )
        .all()
    )

    return categories


# ============================================================
# GET PUBLIC MENU ITEMS
# ============================================================

@router.get(
    "/tables/{public_token}/menu-items",
    response_model=List[PublicMenuItemResponse],
)
def get_public_menu_items(
    public_token: str,
    db: Session = Depends(get_db),
):
    # --------------------------------------------------------
    # Find active table
    # --------------------------------------------------------

    table = (
        db.query(RestaurantTable)
        .filter(
            RestaurantTable.public_token == public_token,
            RestaurantTable.is_active == True,
        )
        .first()
    )

    if not table:
        raise HTTPException(
            status_code=404,
            detail="Table not found or inactive",
        )

    # --------------------------------------------------------
    # Get available menu items for this restaurant
    # --------------------------------------------------------

    menu_items = (
        db.query(MenuItem)
        .filter(
            MenuItem.restaurant_id == table.restaurant_id,
            MenuItem.is_available == True,
        )
        .order_by(
            MenuItem.sort_order.asc(),
            MenuItem.id.asc(),
        )
        .all()
    )

    # --------------------------------------------------------
    # Build response
    # --------------------------------------------------------

    response = []

    for item in menu_items:

        category_ids = [
            link.category_id
            for link in item.category_links
        ]

        response.append(
            {
                "id": item.id,
                "name": item.name,
                "description": item.description,
                "price": float(item.price),
                "image_url": item.image_url,
                "is_available": item.is_available,
                "is_featured": item.is_featured,
                "sort_order": item.sort_order,
                "category_ids": category_ids,
            }
        )

    return response
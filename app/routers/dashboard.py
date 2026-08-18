from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.category import Category
from app.models.menu_item import MenuItem
from app.models.restaurant import Restaurant
from app.models.user import User
from app.schemas.dashboard import DashboardResponse


router = APIRouter(
    prefix="/api/v1/dashboard",
    tags=["Dashboard"],
)

@router.get(
    "",
    response_model=DashboardResponse,
)
def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # --------------------------------------------------------
    # User must have a restaurant
    # --------------------------------------------------------

    if current_user.restaurant_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User does not have a restaurant",
        )

    restaurant_id = current_user.restaurant_id

    # --------------------------------------------------------
    # Get restaurant
    # --------------------------------------------------------

    restaurant = (
        db.query(Restaurant)
        .filter(
            Restaurant.id == restaurant_id
        )
        .first()
    )

    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant not found",
        )

    # --------------------------------------------------------
    # Count categories
    # --------------------------------------------------------

    category_count = (
        db.query(func.count(Category.id))
        .filter(
            Category.restaurant_id == restaurant_id
        )
        .scalar()
    )

    # --------------------------------------------------------
    # Count menu items
    # --------------------------------------------------------

    menu_item_count = (
        db.query(func.count(MenuItem.id))
        .filter(
            MenuItem.restaurant_id == restaurant_id
        )
        .scalar()
    )

    # --------------------------------------------------------
    # Count active menu items
    # --------------------------------------------------------

    active_menu_item_count = (
        db.query(func.count(MenuItem.id))
        .filter(
            MenuItem.restaurant_id == restaurant_id,
            MenuItem.is_available.is_(True),
        )
        .scalar()
    )

    # --------------------------------------------------------
    # Return dashboard
    # --------------------------------------------------------

    return DashboardResponse(
        restaurant={
            "id": restaurant.id,
            "name": restaurant.name,
        },
        stats={
            "categories": category_count or 0,
            "menu_items": menu_item_count or 0,
            "active_menu_items": active_menu_item_count or 0,
        },
    )
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user

from app.models.restaurant import Restaurant
from app.models.user import User

from app.schemas.restaurant import (
    RestaurantCreate,
    RestaurantUpdate,
    RestaurantResponse,
)


router = APIRouter(
    prefix="/api/v1/restaurants",
    tags=["Restaurants"],
)


# ============================================================
# CREATE RESTAURANT
# ============================================================

@router.post(
    "",
    response_model=RestaurantResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_restaurant(
    restaurant_data: RestaurantCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Make sure user doesn't already have a restaurant
    if current_user.restaurant_id is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already has a restaurant",
        )

    # Create restaurant
    restaurant = Restaurant(
        **restaurant_data.model_dump()
    )

    db.add(restaurant)

    # Generate restaurant.id before commit
    db.flush()

    # Attach restaurant to user
    current_user.restaurant_id = restaurant.id

    # Save restaurant + user together
    db.commit()

    db.refresh(restaurant)

    return restaurant


# ============================================================
# GET MY RESTAURANT
# ============================================================

@router.get(
    "",
    response_model=RestaurantResponse,
)
def get_my_restaurant(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.restaurant_id is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant not found",
        )

    restaurant = (
        db.query(Restaurant)
        .filter(
            Restaurant.id == current_user.restaurant_id
        )
        .first()
    )

    if restaurant is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant not found",
        )

    return restaurant


# ============================================================
# UPDATE MY RESTAURANT
# ============================================================

@router.patch(
    "",
    response_model=RestaurantResponse,
)
def update_restaurant(
    restaurant_data: RestaurantUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.restaurant_id is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant not found",
        )

    restaurant = (
        db.query(Restaurant)
        .filter(
            Restaurant.id == current_user.restaurant_id
        )
        .first()
    )

    if restaurant is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant not found",
        )

    # Only update fields actually sent by frontend
    update_data = restaurant_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(
            restaurant,
            field,
            value,
        )

    db.commit()
    db.refresh(restaurant)

    return restaurant
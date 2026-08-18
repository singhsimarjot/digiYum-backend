from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.restaurant import Restaurant
from app.models.user import User
from app.schemas.restaurant import (
    RestaurantCreate,
    RestaurantResponse,
)

router = APIRouter(
    prefix="/api/v1/restaurants",
    tags=["Restaurants"],
)


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
    # 1. Authentication has already been verified
    #    by get_current_user()

    # 2. Make sure user doesn't already own a restaurant
    if current_user.restaurant_id is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already has a restaurant",
        )

    # 3. Make sure slug isn't already used
    existing_restaurant = (
        db.query(Restaurant)
        .filter(
            Restaurant.slug == restaurant_data.slug
        )
        .first()
    )

    if existing_restaurant:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Restaurant with this slug already exists",
        )

    # 4. Create restaurant
    restaurant = Restaurant(
        **restaurant_data.model_dump()
    )

    db.add(restaurant)

    # Generate restaurant.id before commit
    db.flush()

    # 5. Connect restaurant to authenticated user
    current_user.restaurant_id = restaurant.id

    # 6. Save both changes together
    db.commit()

    db.refresh(restaurant)

    return restaurant
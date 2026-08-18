from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db

from app.models.user import User
from app.schemas.user import UserCreate, UserResponse
from app.utils.security import hash_password


from app.models.restaurant import Restaurant
from app.schemas.restaurant import (
    RestaurantCreate,
    RestaurantResponse,
)

router = APIRouter(
    prefix="/api/v1/restaurants",
    tags=["Restaurants"],
)

@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
):
    existing_user = (
        db.query(User)
        .filter(User.email == user_data.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="User with this email already exists",
        )

    user = User(
        email=user_data.email,
        password_hash=hash_password(
            user_data.password
        ),
        first_name=user_data.first_name,
        last_name=user_data.last_name,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user

# RestaurantResponse

@router.post(
    "",
    response_model=RestaurantResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_restaurant(
    restaurant_data: RestaurantCreate,
    db: Session = Depends(get_db),
):
    existing_restaurant = (
        db.query(Restaurant)
        .filter(Restaurant.slug == restaurant_data.slug)
        .first()
    )

    if existing_restaurant:
        raise HTTPException(
            status_code=400,
            detail="Restaurant with this slug already exists",
        )

    restaurant = Restaurant(
        **restaurant_data.model_dump()
    )

    db.add(restaurant)
    db.commit()
    db.refresh(restaurant)

    return restaurant


@router.get(
    "",
    response_model=list[RestaurantResponse],
)
def get_restaurants(
    db: Session = Depends(get_db),
):
    restaurants = (
        db.query(Restaurant)
        .order_by(Restaurant.id.desc())
        .all()
    )

    return restaurants
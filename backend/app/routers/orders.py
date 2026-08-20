from datetime import datetime
from decimal import Decimal
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db

from app.models.restaurant_table import RestaurantTable
from app.models.menu_item import MenuItem
from app.models.order import Order

from app.schemas.order import (
    PublicOrderCreate,
    OrderResponse,
    OrderStatusUpdate,
    OrderStatus,
)

from app.models.order_item import OrderItem

# IMPORTANT:
# Use the same authentication dependency that you already
# use in your protected restaurant/category endpoints.
from app.dependencies import get_current_user

ORDER_STATUS_TRANSITIONS = {
    OrderStatus.PENDING: OrderStatus.CONFIRMED,
    OrderStatus.CONFIRMED: OrderStatus.PREPARING,
    OrderStatus.PREPARING: OrderStatus.READY,
    OrderStatus.READY: OrderStatus.COMPLETED,
}

# ============================================================
# PUBLIC ORDERS
# ============================================================

public_router = APIRouter(
    prefix="/api/v1/public",
    tags=["Public Orders"],
)


# ============================================================
# RESTAURANT ORDERS
# ============================================================

router = APIRouter(
    prefix="/api/v1/orders",
    tags=["Orders"],
)


# ============================================================
# CREATE PUBLIC ORDER
# ============================================================

@public_router.post(
    "/orders",
    response_model=OrderResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_public_order(
    order_data: PublicOrderCreate,
    db: Session = Depends(get_db),
):
    # --------------------------------------------------------
    # Validate items
    # --------------------------------------------------------

    if not order_data.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order must contain at least one item",
        )

    # --------------------------------------------------------
    # Find table using public token
    # --------------------------------------------------------

    table = (
        db.query(RestaurantTable)
        .filter(
            RestaurantTable.public_token == order_data.public_token,
            RestaurantTable.is_active == True,
        )
        .first()
    )

    if not table:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Table not found or inactive",
        )

    restaurant_id = table.restaurant_id

    # --------------------------------------------------------
    # Get menu item IDs
    # --------------------------------------------------------

    menu_item_ids = [
        item.menu_item_id
        for item in order_data.items
    ]

    # --------------------------------------------------------
    # Prevent duplicate menu items
    # --------------------------------------------------------

    if len(menu_item_ids) != len(set(menu_item_ids)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Duplicate menu items are not allowed",
        )

    # --------------------------------------------------------
    # Get menu items belonging to this restaurant
    # --------------------------------------------------------

    menu_items = (
        db.query(MenuItem)
        .filter(
            MenuItem.id.in_(menu_item_ids),
            MenuItem.restaurant_id == restaurant_id,
            MenuItem.is_available == True,
        )
        .all()
    )

    menu_items_by_id = {
        item.id: item
        for item in menu_items
    }

    # --------------------------------------------------------
    # Validate requested menu items
    # --------------------------------------------------------

    for requested_item in order_data.items:

        menu_item = menu_items_by_id.get(
            requested_item.menu_item_id
        )

        if not menu_item:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Menu item "
                    f"{requested_item.menu_item_id} "
                    f"is not available"
                ),
            )

        if requested_item.quantity <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Quantity must be greater than zero",
            )

    # --------------------------------------------------------
    # Calculate subtotal
    # --------------------------------------------------------

    subtotal = Decimal("0.00")

    order_items_data = []

    for requested_item in order_data.items:

        menu_item = menu_items_by_id[
            requested_item.menu_item_id
        ]

        price = Decimal(str(menu_item.price))

        quantity = requested_item.quantity

        item_total = price * quantity

        subtotal += item_total

        order_items_data.append(
            {
                "menu_item_id": menu_item.id,
                "name": menu_item.name,
                "price": price,
                "quantity": quantity,
                "total": item_total,
            }
        )

    # --------------------------------------------------------
    # Tax
    # --------------------------------------------------------
    # Currently 0%.
    # Restaurant-specific tax can be added later.

    tax = Decimal("0.00")

    total = subtotal + tax

    # --------------------------------------------------------
    # Create order
    # --------------------------------------------------------

    order = Order(
        restaurant_id=restaurant_id,
        table_id=table.id,
        order_type="TABLE",
        status=OrderStatus.PENDING,
        customer_name=order_data.customer_name,
        customer_phone=order_data.customer_phone,
        notes=order_data.notes,
        subtotal=subtotal,
        tax=tax,
        total=total,
    )

    db.add(order)

    # Get order.id before creating order items
    db.flush()

    # --------------------------------------------------------
    # Create order items
    # --------------------------------------------------------

    for item_data in order_items_data:

        order_item = OrderItem(
            order_id=order.id,
            menu_item_id=item_data["menu_item_id"],
            name=item_data["name"],
            price=item_data["price"],
            quantity=item_data["quantity"],
            total=item_data["total"],
        )

        db.add(order_item)

    # --------------------------------------------------------
    # Commit
    # --------------------------------------------------------

    db.commit()

    db.refresh(order)

    return order


# ============================================================
# GET PUBLIC ORDER
# ============================================================

@public_router.get(
    "/orders/{order_id}",
    response_model=OrderResponse,
)
def get_public_order(
    order_id: int,
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
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Table not found or inactive",
        )

    # --------------------------------------------------------
    # Find order belonging to this table
    # --------------------------------------------------------

    order = (
        db.query(Order)
        .filter(
            Order.id == order_id,
            Order.restaurant_id == table.restaurant_id,
            Order.table_id == table.id,
        )
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    return order


# ============================================================
# GET RESTAURANT ORDERS
# ============================================================

@router.get(
    "",
    response_model=List[OrderResponse],
)
def get_restaurant_orders(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    # --------------------------------------------------------
    # Make sure user has a restaurant
    # --------------------------------------------------------

    if not current_user.restaurant_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is not assigned to a restaurant",
        )

    # --------------------------------------------------------
    # Get ONLY this user's restaurant orders
    # --------------------------------------------------------

    orders = (
        db.query(Order)
        .filter(
            Order.restaurant_id == current_user.restaurant_id,
        )
        .order_by(
            Order.created_at.desc(),
        )
        .all()
    )

    return orders

# ============================================================
# GET RESTAURANT ORDER BY ID
# ============================================================

@router.get(
    "/{order_id}",
    response_model=OrderResponse,
)
def get_restaurant_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    # --------------------------------------------------------
    # Make sure user has a restaurant
    # --------------------------------------------------------

    if not current_user.restaurant_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is not assigned to a restaurant",
        )

    # --------------------------------------------------------
    # Find order belonging ONLY to user's restaurant
    # --------------------------------------------------------

    order = (
        db.query(Order)
        .filter(
            Order.id == order_id,
            Order.restaurant_id == current_user.restaurant_id,
        )
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    return order

# ============================================================
# UPDATE RESTAURANT ORDER STATUS
# ============================================================

@router.patch(
    "/{order_id}/status",
    response_model=OrderResponse,
)
def update_order_status(
    order_id: int,
    status_data: OrderStatusUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    # --------------------------------------------------------
    # Make sure user has a restaurant
    # --------------------------------------------------------

    if not current_user.restaurant_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is not assigned to a restaurant",
        )

    # --------------------------------------------------------
    # Find order belonging to user's restaurant
    # --------------------------------------------------------

    order = (
        db.query(Order)
        .filter(
            Order.id == order_id,
            Order.restaurant_id == current_user.restaurant_id,
        )
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    # --------------------------------------------------------
    # Allowed statuses
    # --------------------------------------------------------

    allowed_statuses = {
        "PENDING",
        "CONFIRMED",
        "PREPARING",
        "READY",
        "COMPLETED",
        "REJECTED",
        "CANCELLED",
    }

    new_status = status_data.status.upper()

    if new_status not in allowed_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid order status",
        )

    # --------------------------------------------------------
    # Valid status transitions
    # --------------------------------------------------------

    valid_transitions = {
        "PENDING": {
            "CONFIRMED",
            "REJECTED",
            "CANCELLED",
        },
        "CONFIRMED": {
            "PREPARING",
            "CANCELLED",
        },
        "PREPARING": {
            "READY",
        },
        "READY": {
            "COMPLETED",
        },
        "COMPLETED": set(),
        "REJECTED": set(),
        "CANCELLED": set(),
    }

    current_status = order.status.upper()

    if new_status not in valid_transitions.get(
        current_status,
        set(),
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Cannot change order status "
                f"from {current_status} to {new_status}"
            ),
        )

    # --------------------------------------------------------
    # Rejection reason
    # --------------------------------------------------------

    if new_status == "REJECTED":

        if not status_data.rejection_reason:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Rejection reason is required",
            )

        order.rejection_reason = (
            status_data.rejection_reason
        )

        order.rejected_at = datetime.utcnow()

    # --------------------------------------------------------
    # Update status
    # --------------------------------------------------------

    order.status = new_status

    db.commit()

    db.refresh(order)

    return order
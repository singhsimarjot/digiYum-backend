from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)
from sqlalchemy.orm import Session, selectinload

from app.database import get_db
from app.dependencies import get_current_user
from app.models.category import Category
from app.models.category_menu_item import CategoryMenuItem
from app.models.menu_item import MenuItem
from app.models.user import User
from app.schemas.menu_item import (
    MenuItemCreate,
    MenuItemUpdate,
    MenuItemResponse,
)

router = APIRouter(
    prefix="/api/v1/menu-items",
    tags=["Menu Items"],
)


# ============================================================
# CREATE MENU ITEM
# ============================================================

@router.post(
    "",
    response_model=MenuItemResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_menu_item(
    menu_item_data: MenuItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # User must have a restaurant
    if current_user.restaurant_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User does not have a restaurant",
        )

    restaurant_id = current_user.restaurant_id

    # Remove duplicate category IDs
    category_ids = list(
        set(menu_item_data.category_ids)
    )

    # --------------------------------------------------------
    # Validate categories
    # --------------------------------------------------------

    if category_ids:
        categories = (
            db.query(Category)
            .filter(
                Category.id.in_(category_ids),
                Category.restaurant_id == restaurant_id,
            )
            .all()
        )

        # Make sure every category belongs to this restaurant
        if len(categories) != len(category_ids):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="One or more categories are invalid",
            )

    # --------------------------------------------------------
    # Create menu item
    # --------------------------------------------------------

    menu_item = MenuItem(
        restaurant_id=restaurant_id,
        name=menu_item_data.name.strip(),
        description=menu_item_data.description,
        price=menu_item_data.price,
        image_url=menu_item_data.image_url,
        is_available=menu_item_data.is_available,
        is_featured=menu_item_data.is_featured,
        sort_order=menu_item_data.sort_order,
    )

    db.add(menu_item)

    # Generate menu_item.id
    db.flush()

    # --------------------------------------------------------
    # Create category relationships
    # --------------------------------------------------------

    for category_id in category_ids:
        relationship = CategoryMenuItem(
            category_id=category_id,
            menu_item_id=menu_item.id,
        )

        db.add(relationship)

    db.commit()

    # Refresh menu item
    db.refresh(menu_item)

    # --------------------------------------------------------
    # Return response
    # --------------------------------------------------------

    return MenuItemResponse(
        id=menu_item.id,
        restaurant_id=menu_item.restaurant_id,
        name=menu_item.name,
        description=menu_item.description,
        price=menu_item.price,
        image_url=menu_item.image_url,
        is_available=menu_item.is_available,
        is_featured=menu_item.is_featured,
        sort_order=menu_item.sort_order,
        category_ids=category_ids,
        created_at=menu_item.created_at,
        updated_at=menu_item.updated_at,
    )


# ============================================================
# GET ALL MENU ITEMS
# ============================================================

@router.get(
    "",
    response_model=list[MenuItemResponse],
)
def get_menu_items(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # User must have a restaurant
    if current_user.restaurant_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User does not have a restaurant",
        )

    # Load menu items and their category relationships
    menu_items = (
        db.query(MenuItem)
        .options(
            selectinload(
                MenuItem.category_links
            )
        )
        .filter(
            MenuItem.restaurant_id
            == current_user.restaurant_id
        )
        .order_by(
            MenuItem.sort_order.asc()
        )
        .all()
    )

    return [
        MenuItemResponse(
            id=item.id,
            restaurant_id=item.restaurant_id,
            name=item.name,
            description=item.description,
            price=item.price,
            image_url=item.image_url,
            is_available=item.is_available,
            is_featured=item.is_featured,
            sort_order=item.sort_order,
            category_ids=[
                link.category_id
                for link in item.category_links
            ],
            created_at=item.created_at,
            updated_at=item.updated_at,
        )
        for item in menu_items
    ]


# ============================================================
# GET SINGLE MENU ITEM
# ============================================================

@router.get(
    "/{menu_item_id}",
    response_model=MenuItemResponse,
)
def get_menu_item(
    menu_item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # User must have a restaurant
    if current_user.restaurant_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User does not have a restaurant",
        )

    # Find item belonging to this restaurant
    menu_item = (
        db.query(MenuItem)
        .options(
            selectinload(
                MenuItem.category_links
            )
        )
        .filter(
            MenuItem.id == menu_item_id,
            MenuItem.restaurant_id
            == current_user.restaurant_id,
        )
        .first()
    )

    if not menu_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Menu item not found",
        )

    return MenuItemResponse(
        id=menu_item.id,
        restaurant_id=menu_item.restaurant_id,
        name=menu_item.name,
        description=menu_item.description,
        price=menu_item.price,
        image_url=menu_item.image_url,
        is_available=menu_item.is_available,
        is_featured=menu_item.is_featured,
        sort_order=menu_item.sort_order,
        category_ids=[
            link.category_id
            for link in menu_item.category_links
        ],
        created_at=menu_item.created_at,
        updated_at=menu_item.updated_at,
    )

# ============================================================
# UPDATE MENU ITEM
# ============================================================

@router.patch(
    "/{menu_item_id}",
    response_model=MenuItemResponse,
)
def update_menu_item(
    menu_item_id: int,
    menu_item_data: MenuItemUpdate,
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
    # Find menu item belonging to this restaurant
    # --------------------------------------------------------

    menu_item = (
        db.query(MenuItem)
        .options(
            selectinload(
                MenuItem.category_links
            )
        )
        .filter(
            MenuItem.id == menu_item_id,
            MenuItem.restaurant_id == restaurant_id,
        )
        .first()
    )

    if not menu_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Menu item not found",
        )

    # --------------------------------------------------------
    # Update normal fields
    # --------------------------------------------------------

    if menu_item_data.name is not None:
        menu_item.name = menu_item_data.name.strip()

    if menu_item_data.description is not None:
        menu_item.description = (
            menu_item_data.description
        )

    if menu_item_data.price is not None:
        menu_item.price = menu_item_data.price

    if menu_item_data.image_url is not None:
        menu_item.image_url = menu_item_data.image_url

    if menu_item_data.is_available is not None:
        menu_item.is_available = (
            menu_item_data.is_available
        )

    if menu_item_data.is_featured is not None:
        menu_item.is_featured = (
            menu_item_data.is_featured
        )

    if menu_item_data.sort_order is not None:
        menu_item.sort_order = (
            menu_item_data.sort_order
        )

    # --------------------------------------------------------
    # Update categories
    # --------------------------------------------------------

    if menu_item_data.category_ids is not None:

        # Remove duplicates
        category_ids = list(
            set(menu_item_data.category_ids)
        )

        # Validate categories
        if category_ids:

            categories = (
                db.query(Category)
                .filter(
                    Category.id.in_(category_ids),
                    Category.restaurant_id
                    == restaurant_id,
                )
                .all()
            )

            if len(categories) != len(category_ids):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="One or more categories are invalid",
                )

        # Remove existing category relationships
        db.query(CategoryMenuItem).filter(
            CategoryMenuItem.menu_item_id
            == menu_item.id
        ).delete(
            synchronize_session=False
        )

        # Add new category relationships
        for category_id in category_ids:
            relationship = CategoryMenuItem(
                category_id=category_id,
                menu_item_id=menu_item.id,
            )

            db.add(relationship)

    # --------------------------------------------------------
    # Save changes
    # --------------------------------------------------------

    db.commit()

    # Refresh
    db.refresh(menu_item)

    # --------------------------------------------------------
    # Get updated category IDs
    # --------------------------------------------------------

    category_ids = [
        link.category_id
        for link in (
            db.query(CategoryMenuItem)
            .filter(
                CategoryMenuItem.menu_item_id
                == menu_item.id
            )
            .all()
        )
    ]

    # --------------------------------------------------------
    # Return response
    # --------------------------------------------------------

    return MenuItemResponse(
        id=menu_item.id,
        restaurant_id=menu_item.restaurant_id,
        name=menu_item.name,
        description=menu_item.description,
        price=menu_item.price,
        image_url=menu_item.image_url,
        is_available=menu_item.is_available,
        is_featured=menu_item.is_featured,
        sort_order=menu_item.sort_order,
        category_ids=category_ids,
        created_at=menu_item.created_at,
        updated_at=menu_item.updated_at,
    )

# ============================================================
# DELETE MENU ITEM
# ============================================================

@router.delete(
    "/{menu_item_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_menu_item(
    menu_item_id: int,
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

    # --------------------------------------------------------
    # Find menu item belonging to this restaurant
    # --------------------------------------------------------

    menu_item = (
        db.query(MenuItem)
        .filter(
            MenuItem.id == menu_item_id,
            MenuItem.restaurant_id
            == current_user.restaurant_id,
        )
        .first()
    )

    if not menu_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Menu item not found",
        )

    # --------------------------------------------------------
    # Delete menu item
    # --------------------------------------------------------

    db.delete(menu_item)
    db.commit()

    return None
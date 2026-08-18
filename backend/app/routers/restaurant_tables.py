from io import BytesIO

import qrcode
from fastapi.responses import StreamingResponse

from app.config import QR_BASE_URL

import secrets

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user

from app.models.restaurant_table import RestaurantTable
from app.models.user import User

from app.schemas.restaurant_table import (
    RestaurantTableCreate,
    RestaurantTableResponse,
    RestaurantTableUpdate,
)


router = APIRouter(
    prefix="/api/v1/tables",
    tags=["Restaurant Tables"],
)


# ============================================================
# CREATE TABLE
# ============================================================

@router.post(
    "",
    response_model=RestaurantTableResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_table(
    table_data: RestaurantTableCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # --------------------------------------------------------
    # Check restaurant
    # --------------------------------------------------------

    if current_user.restaurant_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User does not have a restaurant",
        )

    restaurant_id = current_user.restaurant_id

    # --------------------------------------------------------
    # Check duplicate table number
    # --------------------------------------------------------

    existing_table = (
        db.query(RestaurantTable)
        .filter(
            RestaurantTable.restaurant_id == restaurant_id,
            RestaurantTable.table_number
            == table_data.table_number,
        )
        .first()
    )

    if existing_table:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Table number already exists",
        )

    # --------------------------------------------------------
    # Generate secure token
    # --------------------------------------------------------

    public_token = secrets.token_urlsafe(32)

    # --------------------------------------------------------
    # Create table
    # --------------------------------------------------------

    table = RestaurantTable(
        restaurant_id=restaurant_id,
        table_number=table_data.table_number,
        name=table_data.name,
        public_token=public_token,
        is_active=True,
    )

    db.add(table)

    try:
        db.commit()
        db.refresh(table)

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Table number already exists",
        )

    return table


# ============================================================
# GET ALL TABLES
# ============================================================

@router.get(
    "",
    response_model=list[RestaurantTableResponse],
)
def get_tables(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # --------------------------------------------------------
    # Check restaurant
    # --------------------------------------------------------

    if current_user.restaurant_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User does not have a restaurant",
        )

    # --------------------------------------------------------
    # Get tables
    # --------------------------------------------------------

    tables = (
        db.query(RestaurantTable)
        .filter(
            RestaurantTable.restaurant_id
            == current_user.restaurant_id
        )
        .order_by(
            RestaurantTable.table_number.asc()
        )
        .all()
    )

    return tables


# ============================================================
# GET SINGLE TABLE
# ============================================================

@router.get(
    "/{table_id}",
    response_model=RestaurantTableResponse,
)
def get_table(
    table_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # --------------------------------------------------------
    # Check restaurant
    # --------------------------------------------------------

    if current_user.restaurant_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User does not have a restaurant",
        )

    # --------------------------------------------------------
    # Get table
    # --------------------------------------------------------

    table = (
        db.query(RestaurantTable)
        .filter(
            RestaurantTable.id == table_id,
            RestaurantTable.restaurant_id
            == current_user.restaurant_id,
        )
        .first()
    )

    if not table:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Table not found",
        )

    return table


# ============================================================
# UPDATE TABLE
# ============================================================

@router.patch(
    "/{table_id}",
    response_model=RestaurantTableResponse,
)
def update_table(
    table_id: int,
    table_data: RestaurantTableUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # --------------------------------------------------------
    # Check restaurant
    # --------------------------------------------------------

    if current_user.restaurant_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User does not have a restaurant",
        )

    # --------------------------------------------------------
    # Get table
    # --------------------------------------------------------

    table = (
        db.query(RestaurantTable)
        .filter(
            RestaurantTable.id == table_id,
            RestaurantTable.restaurant_id
            == current_user.restaurant_id,
        )
        .first()
    )

    if not table:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Table not found",
        )

    # --------------------------------------------------------
    # Update table number
    # --------------------------------------------------------

    if table_data.table_number is not None:

        existing_table = (
            db.query(RestaurantTable)
            .filter(
                RestaurantTable.restaurant_id
                == current_user.restaurant_id,

                RestaurantTable.table_number
                == table_data.table_number,

                RestaurantTable.id != table.id,
            )
            .first()
        )

        if existing_table:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Table number already exists",
            )

        table.table_number = (
            table_data.table_number
        )

    # --------------------------------------------------------
    # Update name
    # --------------------------------------------------------

    if table_data.name is not None:
        table.name = table_data.name

    # --------------------------------------------------------
    # Update active status
    # --------------------------------------------------------

    if table_data.is_active is not None:
        table.is_active = (
            table_data.is_active
        )

    # --------------------------------------------------------
    # Save
    # --------------------------------------------------------

    try:
        db.commit()
        db.refresh(table)

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Table number already exists",
        )

    return table


# ============================================================
# DELETE TABLE
# ============================================================

@router.delete(
    "/{table_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_table(
    table_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # --------------------------------------------------------
    # Check restaurant
    # --------------------------------------------------------

    if current_user.restaurant_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User does not have a restaurant",
        )

    # --------------------------------------------------------
    # Get table
    # --------------------------------------------------------

    table = (
        db.query(RestaurantTable)
        .filter(
            RestaurantTable.id == table_id,
            RestaurantTable.restaurant_id
            == current_user.restaurant_id,
        )
        .first()
    )

    if not table:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Table not found",
        )

    # --------------------------------------------------------
    # Delete
    # --------------------------------------------------------

    db.delete(table)
    db.commit()

    return None


 # --------------------------------------------------------
    # QR code
    # --------------------------------------------------------

@router.get(
    "/{table_id}/qr",
)
def generate_table_qr(
    table_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.restaurant_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User does not have a restaurant",
        )

    table = (
        db.query(RestaurantTable)
        .filter(
            RestaurantTable.id == table_id,
            RestaurantTable.restaurant_id
            == current_user.restaurant_id,
        )
        .first()
    )

    if not table:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Table not found",
        )

    if not table.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Table is inactive",
        )

    # URL that will be stored inside the QR code
    qr_url = (
        f"{QR_BASE_URL}/{table.public_token}"
    )

    # Create QR
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )

    qr.add_data(qr_url)
    qr.make(fit=True)

    image = qr.make_image()

    # Convert image to bytes
    image_bytes = BytesIO()

    image.save(
        image_bytes,
        format="PNG",
    )

    image_bytes.seek(0)

    return StreamingResponse(
        image_bytes,
        media_type="image/png",
        headers={
            "Content-Disposition": (
                f'inline; filename="table-{table.table_number}-qr.png"'
            )
        },
    )
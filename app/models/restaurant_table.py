from __future__ import annotations

from datetime import datetime
from typing import Optional, List

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    String,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class RestaurantTable(Base):
    __tablename__ = "restaurant_tables"


    orders: Mapped[List["Order"]] = relationship(
    "Order",
    back_populates="table",
    )

    __table_args__ = (
        UniqueConstraint(
            "restaurant_id",
            "table_number",
            name="uq_restaurant_table_number",
        ),
    )

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    restaurant_id: Mapped[int] = mapped_column(
        ForeignKey(
            "restaurants.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    table_number: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    name: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
    )

    public_token: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        unique=True,
        index=True,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    restaurant: Mapped["Restaurant"] = relationship(
        "Restaurant",
        back_populates="tables",
    )
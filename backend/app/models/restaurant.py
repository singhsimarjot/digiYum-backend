from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from sqlalchemy import Boolean, DateTime, String, Text 
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Restaurant(Base):
    __tablename__ = "restaurants"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    logo_url: Mapped[Optional[str]] = mapped_column(
        String(500),
        nullable=True,
    )

    phone: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
    )

    email: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
    )

    address: Mapped[Optional[str]] = mapped_column(
        String(500),
        nullable=True,
    )

    city: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
    )

    province: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
    )

    postal_code: Mapped[Optional[str]] = mapped_column(
        String(20),
        nullable=True,
    )

    country: Mapped[str] = mapped_column(
        String(100),
        default="Canada",
        nullable=False,
    )

    currency: Mapped[str] = mapped_column(
        String(10),
        default="CAD",
        nullable=False,
    )

    timezone: Mapped[str] = mapped_column(
        String(100),
        default="America/Toronto",
        nullable=False,
    )

    primary_color: Mapped[Optional[str]] = mapped_column(
        String(20),
        nullable=True,
    )

    secondary_color: Mapped[Optional[str]] = mapped_column(
        String(20),
        nullable=True,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
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

    tables: Mapped[List["RestaurantTable"]] = relationship(
        "RestaurantTable",
        back_populates="restaurant",
        cascade="all, delete-orphan",
    )

    orders: Mapped[List["Order"]] = relationship(
        "Order",
        back_populates="restaurant",
        cascade="all, delete-orphan",
    )
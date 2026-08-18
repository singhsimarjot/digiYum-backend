from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class CategoryMenuItem(Base):
    __tablename__ = "category_menu_items"

    category_id: Mapped[int] = mapped_column(
        ForeignKey(
            "categories.id",
            ondelete="CASCADE",
        ),
        primary_key=True,
    )

    menu_item_id: Mapped[int] = mapped_column(
        ForeignKey(
            "menu_items.id",
            ondelete="CASCADE",
        ),
        primary_key=True,
    )

    menu_item: Mapped["MenuItem"] = relationship(
        "MenuItem",
        back_populates="category_links",
    )

    category: Mapped["Category"] = relationship(
        "Category",
        back_populates="menu_item_links",
    )
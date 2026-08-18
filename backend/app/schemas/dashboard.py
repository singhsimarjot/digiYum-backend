from pydantic import BaseModel


class DashboardRestaurant(BaseModel):
    id: int
    name: str


class DashboardStats(BaseModel):
    categories: int
    menu_items: int
    active_menu_items: int


class DashboardResponse(BaseModel):
    restaurant: DashboardRestaurant
    stats: DashboardStats
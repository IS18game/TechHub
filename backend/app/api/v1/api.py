from fastapi import APIRouter
from app.api.v1.endpoints import products, categories, users, cart, auth, reviews

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(categories.router, prefix="/categories", tags=["categories"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(cart.router, prefix="/cart", tags=["cart"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["reviews"]) 
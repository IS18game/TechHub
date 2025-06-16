from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.models import Product, CartItem
from app.schemas.schemas import CartItemCreate, CartItemResponse
from app.api.deps import get_current_user
from app.models.models import User
from pydantic import BaseModel

router = APIRouter()

class UpdateQuantityRequest(BaseModel):
    quantity: int

@router.get("/items", response_model=List[CartItemResponse])
def get_cart_items(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cart_items = db.query(CartItem).filter(CartItem.user_id == current_user.id).all()
    return cart_items

@router.post("/items", response_model=CartItemResponse)
def add_to_cart(
    cart_item: CartItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    product = db.query(Product).filter(Product.id == cart_item.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if product.stock < cart_item.quantity:
        raise HTTPException(status_code=400, detail="Not enough stock")

    existing_item = db.query(CartItem).filter(
        CartItem.user_id == current_user.id,
        CartItem.product_id == cart_item.product_id
    ).first()

    if existing_item:
        existing_item.quantity += cart_item.quantity
        if existing_item.quantity > product.stock:
            raise HTTPException(status_code=400, detail="Not enough stock")
        db.commit()
        db.refresh(existing_item)
        return existing_item

    new_cart_item = CartItem(
        user_id=current_user.id,
        product_id=cart_item.product_id,
        quantity=cart_item.quantity
    )
    db.add(new_cart_item)
    db.commit()
    db.refresh(new_cart_item)
    return new_cart_item

@router.put("/items/{item_id}", response_model=CartItemResponse)
def update_cart_item(
    item_id: int,
    req: UpdateQuantityRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    quantity = req.quantity
    cart_item = db.query(CartItem).filter(
        CartItem.id == item_id,
        CartItem.user_id == current_user.id
    ).first()

    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    if quantity < 1:
        raise HTTPException(status_code=400, detail="Quantity must be at least 1")

    product = db.query(Product).filter(Product.id == cart_item.product_id).first()
    if product.stock < quantity:
        raise HTTPException(status_code=400, detail="Not enough stock")

    cart_item.quantity = quantity
    db.commit()
    db.refresh(cart_item)
    return cart_item

@router.delete("/items/{item_id}")
def remove_from_cart(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cart_item = db.query(CartItem).filter(
        CartItem.id == item_id,
        CartItem.user_id == current_user.id
    ).first()

    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    db.delete(cart_item)
    db.commit()
    return {"message": "Item removed from cart"} 
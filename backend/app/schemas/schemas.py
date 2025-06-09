from typing import List, Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    sub: str | None = None

class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    username: str
    is_admin: bool

    class Config:
        from_attributes = True

class CategoryBase(BaseModel):
    name: str
    description: str

class CategoryCreate(CategoryBase):
    pass

class Category(CategoryBase):
    id: int

    class Config:
        from_attributes = True

class ProductBase(BaseModel):
    name: str
    description: str
    price: float
    stock: int
    category_id: int
    image_url: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: int
    rating: float = 0.0
    category: Category
    reviews_count: int = 0

    class Config:
        from_attributes = True

class CartItemBase(BaseModel):
    product_id: int
    quantity: int

class CartItemCreate(CartItemBase):
    pass

class CartItemResponse(CartItemBase):
    id: int
    user_id: int
    product: Product

    class Config:
        from_attributes = True

class CartBase(BaseModel):
    pass

class CartCreate(CartBase):
    items: List[CartItemCreate]

class Cart(CartBase):
    id: int
    user_id: int
    items: List[CartItemResponse]

    class Config:
        from_attributes = True

class ReviewBase(BaseModel):
    rating: int
    comment: str

class ReviewCreate(ReviewBase):
    product_id: int

class Review(ReviewBase):
    id: int
    user_id: int
    product_id: int
    created_at: datetime
    user: User
    product: Product

    class Config:
        from_attributes = True

class ReviewResponse(BaseModel):
    id: int
    rating: int
    comment: str
    created_at: datetime
    product: Product

    class Config:
        from_attributes = True 
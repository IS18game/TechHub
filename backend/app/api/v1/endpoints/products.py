from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.db.session import get_db
from app.models.models import Product
from app.schemas.schemas import ProductCreate, Product as ProductSchema

router = APIRouter()

@router.get("/", response_model=List[ProductSchema])
def get_products(
    skip: int = 0,
    limit: int = 100,
    category_id: int = None,
    db: Session = Depends(get_db)
):
    query = db.query(Product).options(joinedload(Product.reviews))
    if category_id:
        query = query.filter(Product.category_id == category_id)
    return query.offset(skip).limit(limit).all()

@router.post("/", response_model=ProductSchema)
def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db)
):
    db_product = Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.get("/{product_id}", response_model=ProductSchema)
def get_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    product = db.query(Product).options(joinedload(Product.reviews)).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.put("/{product_id}", response_model=ProductSchema)
def update_product(
    product_id: int,
    product: ProductCreate,
    db: Session = Depends(get_db)
):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    for key, value in product.dict().items():
        setattr(db_product, key, value)
    
    db.commit()
    db.refresh(db_product)
    return db_product

@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    db.delete(product)
    db.commit()
    return {"message": "Product deleted successfully"} 
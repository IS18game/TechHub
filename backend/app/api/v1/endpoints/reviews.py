from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.api import deps
from app.schemas import schemas
from app.models.models import Review, Product, User

router = APIRouter()

@router.post("/", response_model=schemas.Review)
def create_review(
    review: schemas.ReviewCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Создать отзыв на товар"""
    # Проверяем, существует ли товар
    product = db.query(Product).filter(Product.id == review.product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Товар не найден"
        )
    
    # Проверяем, не оставлял ли пользователь уже отзыв на этот товар
    existing_review = db.query(Review).filter(
        Review.user_id == current_user.id,
        Review.product_id == review.product_id
    ).first()
    
    if existing_review:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Вы уже оставляли отзыв на этот товар"
        )
    
    # Проверяем, что рейтинг в допустимых пределах
    if review.rating < 1 or review.rating > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Рейтинг должен быть от 1 до 5"
        )
    
    # Создаем отзыв
    db_review = Review(
        user_id=current_user.id,
        product_id=review.product_id,
        rating=review.rating,
        comment=review.comment
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    
    # Обновляем средний рейтинг товара
    product_reviews = db.query(Review).filter(Review.product_id == review.product_id).all()
    if product_reviews:
        avg_rating = sum(r.rating for r in product_reviews) / len(product_reviews)
        product.rating = round(avg_rating, 1)
        db.add(product)  # Добавляем товар в сессию
        db.commit()
        db.refresh(product)
    
    return db_review

@router.get("/product/{product_id}", response_model=List[schemas.Review])
def get_product_reviews(
    product_id: int,
    db: Session = Depends(deps.get_db)
):
    """Получить все отзывы для товара"""
    reviews = db.query(Review).filter(Review.product_id == product_id).all()
    return reviews

@router.get("/user/me", response_model=List[schemas.ReviewResponse])
def get_user_reviews(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Получить все отзывы текущего пользователя"""
    reviews = db.query(Review).filter(Review.user_id == current_user.id).all()
    return reviews

@router.put("/{review_id}", response_model=schemas.Review)
def update_review(
    review_id: int,
    review_update: schemas.ReviewBase,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Обновить отзыв"""
    db_review = db.query(Review).filter(Review.id == review_id).first()
    
    if not db_review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Отзыв не найден"
        )
    
    if db_review.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Недостаточно прав для редактирования этого отзыва"
        )
    
    # Проверяем, что рейтинг в допустимых пределах
    if review_update.rating < 1 or review_update.rating > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Рейтинг должен быть от 1 до 5"
        )
    
    # Обновляем отзыв
    db_review.rating = review_update.rating
    db_review.comment = review_update.comment
    db.commit()
    db.refresh(db_review)
    
    # Обновляем средний рейтинг товара
    product_reviews = db.query(Review).filter(Review.product_id == db_review.product_id).all()
    if product_reviews:
        avg_rating = sum(r.rating for r in product_reviews) / len(product_reviews)
        product = db.query(Product).filter(Product.id == db_review.product_id).first()
        if product:
            product.rating = round(avg_rating, 1)
            db.add(product)  # Добавляем товар в сессию
            db.commit()
    
    return db_review

@router.delete("/{review_id}")
def delete_review(
    review_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Удалить отзыв"""
    db_review = db.query(Review).filter(Review.id == review_id).first()
    
    if not db_review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Отзыв не найден"
        )
    
    if db_review.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Недостаточно прав для удаления этого отзыва"
        )
    
    product_id = db_review.product_id
    db.delete(db_review)
    db.commit()
    
    # Обновляем средний рейтинг товара
    product_reviews = db.query(Review).filter(Review.product_id == product_id).all()
    product = db.query(Product).filter(Product.id == product_id).first()
    if product:
        if product_reviews:
            avg_rating = sum(r.rating for r in product_reviews) / len(product_reviews)
            product.rating = round(avg_rating, 1)
        else:
            product.rating = 0.0
        db.add(product)  # Добавляем товар в сессию
        db.commit()
    
    return {"message": "Отзыв успешно удален"} 
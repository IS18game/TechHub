from sqlalchemy.orm import Session
from app.db.base_class import Base
from app.db.session import engine
from app.models.models import Category, Product, User, CartItem
from app.core.security import get_password_hash
import logging
from sqlalchemy import text

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db() -> None:
    logger.info("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully")

def create_initial_data(db: Session) -> None:
    logger.info("Creating initial data...")
    
    # Create admin users if they don't exist
    admin1 = db.query(User).filter(User.email == "admin@admin.com").first()
    if not admin1:
        admin1 = User(
            email="admin@admin.com",
            username="admin",
            hashed_password=get_password_hash("admin"),
            is_admin=True
        )
        db.add(admin1)
        db.commit()
        logger.info("Created admin user 1")

    admin2 = db.query(User).filter(User.email == "admin2@admin.com").first()
    if not admin2:
        admin2 = User(
            email="admin2@admin.com",
            username="admin2",
            hashed_password=get_password_hash("admin"),
            is_admin=True
        )
        db.add(admin2)
        db.commit()
        logger.info("Created admin user 2")

    # Create categories if they don't exist
    categories = [
        {"name": "Процессоры", "description": "Центральные процессоры для компьютеров"},
        {"name": "Видеокарты", "description": "Графические процессоры для игр и работы"},
        {"name": "Материнские платы", "description": "Основные платы для сборки компьютера"},
        {"name": "Оперативная память", "description": "Модули памяти для компьютера"},
        {"name": "Накопители", "description": "SSD и HDD накопители"},
    ]

    for cat_data in categories:
        category = db.query(Category).filter(Category.name == cat_data["name"]).first()
        if not category:
            category = Category(**cat_data)
            db.add(category)
            db.commit()
            logger.info(f"Created category: {cat_data['name']}")

    # Create products if they don't exist
    products = [
        {
            "name": "Intel Core i7-12700K",
            "description": "12-ядерный процессор Intel Core i7",
            "price": 35000.0,
            "stock": 10,
            "category_id": 1,
            "image_url": "https://avatars.mds.yandex.net/get-goods_pic/11398227/hat4b8ccb2d7a3d9309d943b5d728a41086/600x600"
        },
        {
            "name": "AMD Ryzen 9 5950X",
            "description": "16-ядерный процессор AMD Ryzen 9",
            "price": 45000.0,
            "stock": 8,
            "category_id": 1,
            "image_url": "https://img.4gamers.com.tw/ckfinder-th/files/amd%20ryzen%209%205950x/11.jpg?versionId=LHGs0f_wrOW93Vjq6fMQ5E9wZHwzpbJk"
        },
        {
            "name": "NVIDIA GeForce RTX 3080",
            "description": "Видеокарта NVIDIA RTX 3080",
            "price": 80000.0,
            "stock": 5,
            "category_id": 2,
            "image_url": "https://cdn.mos.cms.futurecdn.net/oskwAZyTdiJF9wQCYsV9Uh.jpg"
        },
        {
            "name": "AMD Radeon RX 6800 XT",
            "description": "Видеокарта AMD Radeon RX 6800 XT",
            "price": 75000.0,
            "stock": 6,
            "category_id": 2,
            "image_url": "https://avatars.mds.yandex.net/get-mpic/5221251/img_id1665110708982750673.jpeg/orig"
        },
        {
            "name": "ASUS ROG STRIX B550-F",
            "description": "Материнская плата ASUS ROG STRIX",
            "price": 20000.0,
            "stock": 15,
            "category_id": 3,
            "image_url": "https://avatars.mds.yandex.net/get-goods_pic/6240941/hat8dae8d9a25a2b7f64cf6527bdce33e66/600x600"
        },
        {
            "name": "G.Skill Trident Z RGB",
            "description": "Оперативная память G.Skill 32GB",
            "price": 15000.0,
            "stock": 20,
            "category_id": 4,
            "image_url": "https://avatars.mds.yandex.net/get-mpic/1724439/img_id1689354946857813081.jpeg/optimize"
        },
        {
            "name": "Samsung 970 EVO Plus",
            "description": "SSD накопитель Samsung 1TB",
            "price": 12000.0,
            "stock": 25,
            "category_id": 5,
            "image_url": "https://avatars.mds.yandex.net/i?id=3d4ebd19cf764d69c718098cd42d50c8_l-5452219-images-thumbs&n=13"
        }
    ]

    for prod_data in products:
        product = db.query(Product).filter(Product.name == prod_data["name"]).first()
        if not product:
            product = Product(**prod_data)
            db.add(product)
            db.commit()
            logger.info(f"Created product: {prod_data['name']}")
        else:
            # Update existing product with new data
            for key, value in prod_data.items():
                setattr(product, key, value)
            db.commit()
            logger.info(f"Updated product: {prod_data['name']}")

    logger.info("Initial data creation completed") 
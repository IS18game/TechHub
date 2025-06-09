import sys
import os
from datetime import datetime

# Add the parent directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal, engine
from app.models.models import Base, Product, Category

# Create tables
Base.metadata.create_all(bind=engine)

# Components data
components = [
    # Видеокарты
    {
        "name": "NVIDIA GeForce RTX 4090",
        "description": "Флагманская видеокарта с 24 ГБ GDDR6X памяти, поддержка DLSS 3.0 и трассировки лучей",
        "price": 189999,
        "rating": 4.9,
        "category_name": "Видеокарты"
    },
    {
        "name": "AMD Radeon RX 7900 XTX",
        "description": "Мощная видеокарта с 24 ГБ GDDR6 памяти, отличная производительность в 4K",
        "price": 129999,
        "rating": 4.8,
        "category_name": "Видеокарты"
    },
    {
        "name": "NVIDIA GeForce RTX 4080 Super",
        "description": "Высокопроизводительная видеокарта с 16 ГБ GDDR6X памяти",
        "price": 99999,
        "rating": 4.7,
        "category_name": "Видеокарты"
    },
    {
        "name": "AMD Radeon RX 7800 XT",
        "description": "Отличное соотношение цена/производительность, 16 ГБ GDDR6 памяти",
        "price": 69999,
        "rating": 4.6,
        "category_name": "Видеокарты"
    },
    {
        "name": "NVIDIA GeForce RTX 4070 Ti Super",
        "description": "Эффективная видеокарта среднего класса с 12 ГБ GDDR6X памяти",
        "price": 79999,
        "rating": 4.5,
        "category_name": "Видеокарты"
    },

    # Процессоры
    {
        "name": "Intel Core i9-14900K",
        "description": "Топовый процессор с 24 ядрами (8P+16E), до 6.0 ГГц",
        "price": 89999,
        "rating": 4.9,
        "category_name": "Процессоры"
    },
    {
        "name": "AMD Ryzen 9 7950X3D",
        "description": "Мощный процессор с 3D V-Cache, 16 ядер, до 5.7 ГГц",
        "price": 84999,
        "rating": 4.8,
        "category_name": "Процессоры"
    },
    {
        "name": "Intel Core i7-14700K",
        "description": "Высокопроизводительный процессор с 20 ядрами (8P+12E)",
        "price": 59999,
        "rating": 4.7,
        "category_name": "Процессоры"
    },
    {
        "name": "AMD Ryzen 7 7800X3D",
        "description": "Оптимизированный для игр процессор с 3D V-Cache, 8 ядер",
        "price": 49999,
        "rating": 4.8,
        "category_name": "Процессоры"
    },
    {
        "name": "Intel Core i5-14600K",
        "description": "Сбалансированный процессор с 14 ядрами (6P+8E)",
        "price": 39999,
        "rating": 4.6,
        "category_name": "Процессоры"
    },

    # Материнские платы
    {
        "name": "ASUS ROG Maximus Z790 Hero",
        "description": "Премиальная материнская плата для Intel с поддержкой DDR5 и PCIe 5.0",
        "price": 69999,
        "rating": 4.8,
        "category_name": "Материнские платы"
    },
    {
        "name": "MSI MEG X670E ACE",
        "description": "Флагманская плата для AMD с расширенными возможностями разгона",
        "price": 64999,
        "rating": 4.7,
        "category_name": "Материнские платы"
    },
    {
        "name": "Gigabyte Z790 Aorus Master",
        "description": "Мощная плата с отличной системой охлаждения и сетевой картой 2.5G",
        "price": 54999,
        "rating": 4.6,
        "category_name": "Материнские платы"
    },
    {
        "name": "ASRock X670E Steel Legend",
        "description": "Надежная плата для AMD с поддержкой PCIe 5.0 и USB 4.0",
        "price": 44999,
        "rating": 4.5,
        "category_name": "Материнские платы"
    },
    {
        "name": "MSI MPG B650 Carbon WiFi",
        "description": "Сбалансированная плата с WiFi 6E и поддержкой DDR5",
        "price": 34999,
        "rating": 4.4,
        "category_name": "Материнские платы"
    },

    # Корпуса
    {
        "name": "Lian Li O11 Dynamic EVO",
        "description": "Премиальный корпус с отличной вентиляцией и поддержкой водяного охлаждения",
        "price": 24999,
        "rating": 4.9,
        "category_name": "Корпуса"
    },
    {
        "name": "Fractal Design Torrent",
        "description": "Инновационный дизайн с фронтальными вентиляторами 180мм",
        "price": 19999,
        "rating": 4.8,
        "category_name": "Корпуса"
    },
    {
        "name": "Phanteks Evolv X",
        "description": "Стильный корпус с отличной системой управления кабелями",
        "price": 17999,
        "rating": 4.7,
        "category_name": "Корпуса"
    },
    {
        "name": "be quiet! Dark Base Pro 900",
        "description": "Тихий корпус с модульной конструкцией и звукоизоляцией",
        "price": 22999,
        "rating": 4.6,
        "category_name": "Корпуса"
    },
    {
        "name": "Corsair 5000D Airflow",
        "description": "Оптимизированный для воздушного потока корпус с поддержкой до 10 вентиляторов",
        "price": 15999,
        "rating": 4.5,
        "category_name": "Корпуса"
    }
]

def add_components():
    db = SessionLocal()
    try:
        # Create categories if they don't exist
        categories = {}
        for component in components:
            category_name = component["category_name"]
            if category_name not in categories:
                category = db.query(Category).filter(Category.name == category_name).first()
                if not category:
                    category = Category(name=category_name)
                    db.add(category)
                    db.flush()
                categories[category_name] = category

        # Add products
        for component in components:
            product = Product(
                name=component["name"],
                description=component["description"],
                price=component["price"],
                rating=component["rating"],
                category_id=categories[component["category_name"]].id,
                created_at=datetime.utcnow()
            )
            db.add(product)

        db.commit()
        print("Components added successfully!")
    except Exception as e:
        print(f"Error adding components: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_components() 
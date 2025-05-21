from fastapi import FastAPI, Form, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import uuid

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="templates")

sessions = {}

@app.middleware("http")
async def add_session(request: Request, call_next):
    session_token = request.cookies.get("session_token")
    if not session_token:
        session_token = str(uuid.uuid4())
        sessions[session_token] = {"cart": []}
        response = await call_next(request)
        response.set_cookie("session_token", session_token)
        return response
    if session_token not in sessions:
        sessions[session_token] = {"cart": []}
    response = await call_next(request)
    return response

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("home.html", {"request": request, "products": products})

@app.post("/add_to_cart")
async def add_to_cart(request: Request, product_id: int = Form(...)):
    session_token = request.cookies.get("session_token")
    if session_token in sessions:
        sessions[session_token]["cart"].append(product_id)
    else:
        sessions[session_token] = {"cart": [product_id]}
    return RedirectResponse(url="/cart", status_code=303)

@app.post("/remove_from_cart")
async def remove_from_cart(request: Request, product_id: int = Form(...)):
    session_token = request.cookies.get("session_token")
    if session_token in sessions:
        try:
            sessions[session_token]["cart"].remove(product_id)
        except ValueError:
            pass
    return RedirectResponse(url="/cart", status_code=303)

@app.get("/cart", response_class=HTMLResponse)
async def cart(request: Request):
    session_token = request.cookies.get("session_token")
    cart_items = sessions.get(session_token, {}).get("cart", [])
    cart_products = [{"id": pid, **products_catalog[pid]} for pid in cart_items if pid in products_catalog]
    return templates.TemplateResponse("cart.html", {"request": request, "cart_products": cart_products})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)

page_titles = {
    "about": "О нас",
    "contacts": "Контакты",
    "vacancies": "Вакансии",
    "news": "Новости",
    "delivery": "Доставка и оплата",
    "warranty": "Гарантия",
    "returns": "Возврат товара",
    "faq": "FAQ",
    "bonus": "Бонусная программа",
    "credit": "Кредит",
    "installment": "Рассрочка",
    "discounts": "Скидки"
}

@app.get("/{page_name}", response_class=HTMLResponse)
async def under_construction(request: Request, page_name: str):
    title = page_titles.get(page_name, "Страница в разработке")
    return templates.TemplateResponse("under_construction.html", {"request": request, "title": title})

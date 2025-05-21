from fastapi import FastAPI, Form, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import uuid
from pydantic import Basemodel

app = FastApi()
users = []

class User(BaseModel):
    username: str
    email: str
    password: str

@app.post("/create user")
def create_user_route(data: User):
    if data.username == "admin" or "test":
        return {
            "access": f"{data.username} access",
        }
    else:
        return {
            "access": f"{data.username} access",
        }

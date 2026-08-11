from fastapi import FastAPI, Depends, HTTPException, Query, status, UploadFile, File
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from dotenv import load_dotenv
import os

load_dotenv()

from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional

from database import init_db
from models import Property, User
from schemas import (
    PropertyResponse, PropertyCreate, PropertyUpdate,
    UserCreate, UserLogin, UserResponse, Token,
)
from security import hash_password, verify_password, create_access_token
from auth import get_db, get_current_user
from storage import upload_image_bytes

from chat import router as chat_router

app = FastAPI(title="Indian Property Search API", version="1.0.0")
app.include_router(chat_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_IMAGE_SIZE_MB = 5

@app.on_event("startup")
def startup_event():
    init_db()


# Serve React frontend static files if the dist folder exists
FRONTEND_DIST = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
if os.path.isdir(FRONTEND_DIST):
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIST, "assets")), name="assets")

    @app.get("/")
    def serve_root():
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        """Catch-all: serve index.html for any non-API route (SPA client-side routing)."""
        # Don't intercept /api/* routes — FastAPI handles those
        file_path = os.path.join(FRONTEND_DIST, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))
else:
    @app.get("/")
    def root():
        return {"message": "Indian Property Search API is running", "docs": "/docs"}


# ---------------- Image Upload ----------------

@app.post("/api/upload-image")
async def upload_property_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Only JPEG, PNG, WEBP or GIF images are allowed",
        )

    contents = await file.read()
    if len(contents) > MAX_IMAGE_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail=f"Image must be smaller than {MAX_IMAGE_SIZE_MB}MB",
        )
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    try:
        url = upload_image_bytes(contents, file.filename or "upload.jpg", file.content_type)
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"url": url}

# ---------------- Auth ----------------

@app.post("/api/auth/register", response_model=Token)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    email = payload.email.lower()
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        name=payload.name,
        email=email,
        hashed_password=hash_password(payload.password),
        role="user",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token({"sub": str(user.id)})
    return Token(access_token=token, user=UserResponse.model_validate(user))


@app.post("/api/auth/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token({"sub": str(user.id)})
    return Token(access_token=token, user=UserResponse.model_validate(user))


@app.get("/api/auth/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


# ---------------- Properties ----------------

@app.get("/api/properties", response_model=List[PropertyResponse])
def get_properties(
    city: Optional[str] = None,
    type: Optional[str] = None,
    property_type: Optional[str] = None,
    min_price: Optional[int] = None,
    max_price: Optional[int] = None,
    bhk: Optional[int] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Property)
    if city:
        query = query.filter(Property.city.ilike(city))
    if type:
        query = query.filter(Property.type == type)
    if property_type:
        query = query.filter(Property.property_type == property_type)
    if min_price is not None:
        query = query.filter(Property.price >= min_price)
    if max_price is not None:
        query = query.filter(Property.price <= max_price)
    if bhk is not None:
        query = query.filter(Property.bhk == bhk)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            Property.title.ilike(search_filter)
            | Property.locality.ilike(search_filter)
            | Property.description.ilike(search_filter)
            | Property.amenities.ilike(search_filter)
        )
    return query.all()


# IMPORTANT: this must be declared BEFORE /api/properties/{property_id}
@app.get("/api/properties/mine", response_model=List[PropertyResponse])
def get_my_properties(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role == "admin":
        return db.query(Property).all()
    return db.query(Property).filter(Property.owner_id == current_user.id).all()


@app.get("/api/properties/{property_id}", response_model=PropertyResponse)
def get_property_detail(property_id: int, db: Session = Depends(get_db)):
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    return prop


@app.post("/api/properties", response_model=PropertyResponse, status_code=status.HTTP_201_CREATED)
def create_property(
    payload: PropertyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not payload.image_url and not payload.image_filename:
        raise HTTPException(status_code=400, detail="Please upload a property image")
    prop = Property(**payload.model_dump(), owner_id=current_user.id)
    db.add(prop)
    db.commit()
    db.refresh(prop)
    return prop


@app.put("/api/properties/{property_id}", response_model=PropertyResponse)
def update_property(
    property_id: int,
    payload: PropertyUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    if current_user.role != "admin" and prop.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this property")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(prop, field, value)
    db.commit()
    db.refresh(prop)
    return prop


@app.delete("/api/properties/{property_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_property(
    property_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    if current_user.role != "admin" and prop.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this property")
    db.delete(prop)
    db.commit()
    return None
from fastapi import FastAPI, Query, File, UploadFile, HTTPException
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel, Field, validator, root_validator
from typing import Optional

from error_handler import validation_exception_handler
from validators import validate_email, validate_password_strength

app = FastAPI()
app.add_exception_handler(RequestValidationError, validation_exception_handler)


# --- Models ---

class UserRegistration(BaseModel):
    email: str
    password: str
    password_confirmation: str

    _validate_email = validator('email', allow_reuse=True)(validate_email)
    _validate_password = validator('password', allow_reuse=True)(validate_password_strength)

    @root_validator()
    def passwords_match(cls, values):
        p1, p2 = values.get('password'), values.get('password_confirmation')
        if p1 is not None and p2 is not None and p1 != p2:
            raise ValueError('Passwords do not match')
        return values

class Item(BaseModel):
    name: str = Field(..., min_length=3, max_length=50)
    price: float = Field(..., gt=0, description="The price must be greater than zero")
    tax: Optional[float] = None


# --- Endpoints ---

@app.post("/register/")
async def register_user(user: UserRegistration):
    # In a real app, you would save the user to the database here
    return {"message": f"User with email {user.email} registered successfully."}

@app.post("/items/")
async def create_item(item: Item):
    return item

@app.get("/items/search/")
async def search_items(q: Optional[str] = Query(None, min_length=3)):
    return {"query": q}

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB
ALLOWED_FILE_TYPES = ["image/jpeg", "image/png"]

@app.post("/files/upload/")
async def upload_file(file: UploadFile = File(...)):
    if file.content_type not in ALLOWED_FILE_TYPES:
        raise HTTPException(status_code=400, detail="Invalid file type.")

    # In a real app, you would stream the file to disk instead of reading into memory
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds the limit of 5 MB.")

    return {"filename": file.filename, "size": len(contents)}

if __name__ == "__main__":
    import uvicorn
    print("To run this example: uvicorn main_example:app --reload")
    print("Try sending requests to:")
    print(" - POST /register/ with valid/invalid data")
    print(" - POST /items/ with valid/invalid data")
    print(" - GET /items/search/?q=... with short/long query")
    print(" - POST /files/upload/ with a file")

    # Example curl requests:
    # curl -X POST "http://127.0.0.1:8000/register/" -H "Content-Type: application/json" -d '{"email": "test@example.com", "password": "password123", "password_confirmation": "password123"}'
    # curl -X POST "http://127.0.0.1:8000/register/" -H "Content-Type: application/json" -d '{"email": "invalid", "password": "short", "password_confirmation": "mismatch"}'

    uvicorn.run(app, host="0.0.0.0", port=8000)

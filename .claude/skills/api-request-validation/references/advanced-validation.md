# Advanced Validation Techniques

## Cross-Field Validation

Sometimes you need to validate a field based on the value of another field. Use `@root_validator` for this.

```python
from pydantic import BaseModel, root_validator

class Registration(BaseModel):
    password: str
    password_confirmation: str

    @root_validator()
    def passwords_match(cls, values):
        p1, p2 = values.get('password'), values.get('password_confirmation')
        if p1 is not None and p2 is not None and p1 != p2:
            raise ValueError('Passwords do not match')
        return values
```

## Query Parameter Validation

FastAPI lets you use the same `Field` syntax for query parameters using `fastapi.Query`.

```python
from fastapi import FastAPI, Query

app = FastAPI()

@app.get("/items/")
async def read_items(q: str | None = Query(None, min_length=3, max_length=50, regex="^fixedquery$")):
    results = {"items": [{"item_id": "Foo"}, {"item_id": "Bar"}]}
    if q:
        results.update({"q": q})
    return results
```

## File Upload Validation

For file uploads, use `UploadFile` and `File` from FastAPI. You can't directly validate file size in the Pydantic model before upload, but you can check it in the endpoint.

```python
from fastapi import FastAPI, File, UploadFile, HTTPException

app = FastAPI()

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB
ALLOWED_FILE_TYPES = ["image/jpeg", "image/png"]

@app.post("/uploadfile/")
async def create_upload_file(file: UploadFile = File(...)):
    if file.content_type not in ALLOWED_FILE_TYPES:
        raise HTTPException(status_code=400, detail="Invalid file type")

    # This is a simple way to check size, but it reads the whole file into memory.
    # For very large files, a streaming check would be better.
    size = await file.read()
    if len(size) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File is too large")

    await file.seek(0) # Reset file pointer after reading

    return {"filename": file.filename, "content_type": file.content_type}
```

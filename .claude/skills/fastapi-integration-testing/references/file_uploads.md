# Testing File Uploads

FastAPI's `TestClient` can be used to test endpoints that handle file uploads.

## Basic File Upload

To test file uploads, you pass a `files` dictionary to the client request method (`post`, `put`, etc.).

The structure of the `files` dictionary is:
`{"file_parameter_name": (filename, file_content, content_type)}`

Here's an example:

```python
from fastapi.testclient import TestClient
import io

def test_upload_file(client: TestClient):
    """
    Test uploading a simple text file.
    """
    # Create an in-memory file-like object
    file_content = b"This is a test file."
    file_to_upload = ("test_file.txt", file_content, "text/plain")

    response = client.post("/uploadfile/", files={"file": file_to_upload})

    assert response.status_code == 200
    assert response.json() == {"filename": "test_file.txt", "content_type": "text/plain"}
```

### Explanation:

1.  `file_content`: The content of the file in bytes.
2.  `file_to_upload`: A tuple containing the filename, the file content, and the MIME type.
3.  `files={"file": ...}`: The dictionary key `file` must match the name of the `UploadFile` parameter in your endpoint's signature.

```python
# Your endpoint might look like this:
# @app.post("/uploadfile/")
# async def create_upload_file(file: UploadFile):
#     ...
```

## Uploading an Image

The process is the same for binary files like images. You just need to provide the correct content type.

```python
def test_upload_image(client: TestClient):
    """
    Test uploading a PNG image.
    """
    # In a real scenario, you might load a test image from disk.
    # For this example, we'll use a dummy 1x1 pixel PNG.
    png_content = b'\\x89PNG\\r\\n\\x1a\\n\\x00\\x00\\x00\\rIHDR\\x00\\x00\\x00\\x01\\x00\\x00\\x00\\x01\\x08\\x06\\x00\\x00\\x00\\x1f\\x15\\xc4\\x89\\x00\\x00\\x00\\nIDATx\\x9cc\\x00\\x01\\x00\\x00\\x05\\x00\\x01\\r\\n-\\xb4\\x00\\x00\\x00\\x00IEND\\xaeB`\\x82'
    image_to_upload = ("test_image.png", png_content, "image/png")

    response = client.post("/upload-image/", files={"image": image_to_upload})

    assert response.status_code == 200
    assert response.json()["filename"] == "test_image.png"
```

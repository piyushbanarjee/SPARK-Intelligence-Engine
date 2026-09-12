import io
import pytesseract
from PIL import Image

def extract_text_from_image(file_bytes: bytes) -> str:
    image = Image.open(io.BytesIO(file_bytes))
    extracted_text = pytesseract.image_to_string(image)
    return extracted_text.strip()


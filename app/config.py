import os

from dotenv import load_dotenv


load_dotenv()


QR_BASE_URL = os.getenv(
    "QR_BASE_URL",
    "http://localhost:3000/t",
)
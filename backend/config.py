import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "change-me-in-prod")
    DEBUG = os.getenv("FLASK_DEBUG", "true").lower() == "true"

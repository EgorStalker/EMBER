import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    NASA_API_KEY = os.getenv("NASA_FIRMS_API_KEY")
    WEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")
    MAPBOX_TOKEN = os.getenv("MAPBOX_TOKEN")
    
    # Используем данные по всему миру (для тестов можно ограничить регионом)
    NASA_FIRMS_URL = "https://firms.modis.eosdis.nasa.gov/api/area/csv/{api_key}/MODIS_SPHERICAL/-180,-90,180,90/1"
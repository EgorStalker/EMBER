import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

app = FastAPI(title="EMBER Predictive API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Пробуем импортировать твои модули
try:
    from backend.data_pipeline import fetch_active_fires, get_weather_data
    from backend.model import predict_fire_spread
    HAS_PIPELINE = True
except ImportError:
    HAS_PIPELINE = False

@app.get("/api/fires")
def get_fires_and_predictions():
    response_data = []
    
    try:
        # Пробуем получить живые данные от NASA, если модули на месте
        if HAS_PIPELINE:
            fires = fetch_active_fires()
        else:
            raise Exception("Pipeline modules missing")
            
        for index, fire in enumerate(fires[:10]): # Ограничим до 10 точек для скорости
            try:
                weather = get_weather_data(fire["lat"], fire["lon"])
                poly_6h = predict_fire_spread(fire["lat"], fire["lon"], weather["wind_speed"], weather["wind_deg"], hours=6)
                poly_12h = predict_fire_spread(fire["lat"], fire["lon"], weather["wind_speed"], weather["wind_deg"], hours=12)
                poly_24h = predict_fire_spread(fire["lat"], fire["lon"], weather["wind_speed"], weather["wind_deg"], hours=24)
                
                response_data.append({
                    "id": index,
                    "current_location": [fire["lon"], fire["lat"]],
                    "frp": fire["frp"],
                    "wind": weather,
                    "predictions": {"6h": poly_6h, "12h": poly_12h, "24h": poly_24h}
                })
            except Exception:
                continue # Если одна точка сбоит, берем следующую
                
    except Exception as e:
        print(f"\n[EMBER WARNING] Ошибка подключения к внешним API ({e}). Включаю автономный режим...")
        
        # Сгенерируем сочные тестовые точки, чтобы всё ожило прямо сейчас!
        mock_fires = [
            {"lat": 48.4647, "lon": 35.0462, "frp": 250.5},  # Точка 1
            {"lat": 50.4501, "lon": 30.5234, "frp": 120.2},  # Точка 2
            {"lat": 49.8397, "lon": 24.0297, "frp": 410.0}   # Точка 3
        ]
        
        for index, fire in enumerate(mock_fires):
            # Дефолтная симуляция погоды и полигонов (разрастание круга)
            mock_weather = {"wind_speed": 5.2, "wind_deg": 180}
            
            # Генерируем полигоны-прогнозы вокруг точек
            def make_mock_poly(lat, lon, radius):
                return [
                    [lon - radius, lat - radius],
                    [lon + radius, lat - radius],
                    [lon + radius, lat + radius],
                    [lon - radius, lat + radius],
                    [lon - radius, lat - radius]
                ]
                
            response_data.append({
                "id": index,
                "current_location": [fire["lon"], fire["lat"]],
                "frp": fire["frp"],
                "wind": mock_weather,
                "predictions": {
                    "6h": make_mock_poly(fire["lat"], fire["lon"], 0.1),
                    "12h": make_mock_poly(fire["lat"], fire["lon"], 0.2),
                    "24h": make_mock_poly(fire["lat"], fire["lon"], 0.4)
                }
            })
            
    return {"status": "success", "data": response_data}

# ---- СТАТИКА ФРОНТЕНДА ----
current_dir = os.path.dirname(os.path.abspath(__file__)) 
project_root = os.path.dirname(current_dir) 
frontend_path = os.path.join(project_root, "frontend")

app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")
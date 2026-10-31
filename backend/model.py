import math

def predict_fire_spread(lat, lon, wind_speed, wind_deg, hours=24):
    """
    Рассчитывает прогнозный полигон распространения огня.
    Использует тригонометрическое смещение по вектору ветра.
    """
    # Базовая скорость расширения пожара (в градусах координат для простоты)
    base_spread = 0.005 * hours
    # Фактор ветра: чем сильнее ветер, тем сильнее вытягивается эллипс пожара
    wind_influence = wind_speed * 0.002 * hours
    
    # Переводим угол ветра в радианы
    angle_rad = math.radians(wind_deg)
    
    # Расчет смещения центра пожара по ветру
    center_shift_lat = math.cos(angle_rad) * wind_influence
    center_shift_lon = math.sin(angle_rad) * wind_influence
    
    predicted_center_lat = lat + center_shift_lat
    predicted_center_lon = lon + center_shift_lon
    
    # Генерируем 8 точек эллипса зоны поражения
    polygon_points = []
    for i in range(0, 360, 45):
        rad = math.radians(i)
        # Радиус эллипса увеличивается вдоль оси ветра
        r = base_spread + (wind_influence if abs(i - wind_deg) < 90 else base_spread * 0.5)
        p_lat = predicted_center_lat + math.cos(rad) * r
        p_lon = predicted_center_lon + math.sin(rad) * r
        polygon_points.append([p_lon, p_lat])
        
    # Замыкаем полигон (первая точка должна быть равна последней)
    polygon_points.append(polygon_points[0])
    return polygon_points
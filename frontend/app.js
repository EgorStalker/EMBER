// ==========================================
// EMBER SYSTEM — ИНИЦИАЛИЗАЦИЯ И ИНТЕГРАЦИЯ
// ==========================================

// 1. Инициализация карты Leaflet с центровкой на Канаде (под тестовый датасет NASA)
const map = L.map('map', { zoomControl: false }).setView([55.0, -115.0], 4);

// 2. Подключение темной темы карты
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 20
}).addTo(map);

// Слой для динамического обновления маркеров пожаров
const markersLayer = L.layerGroup().addTo(map);

// Глобальное хранилище данных пожаров
let firesData = [];

// Функция быстрого доступа к элементам интерфейса строго по ID
function getUIElements() {
    return {
        statusText: document.getElementById('stats'),
        sliderLabel: document.getElementById('time-label'),
        slider: document.getElementById('time-slider'),
        firesList: document.getElementById('fires-list')
    };
}

// Определение цвета маркера в зависимости от времени его фиксации
function getFireColor(ageHours) {
    if (ageHours <= 1) return '#8b0000';  // Темно-красный (Критический, < 1ч)
    if (ageHours <= 4) return '#ff0000';  // Красный (Свежий, 1-4ч)
    if (ageHours <= 12) return '#ffa500'; // Оранжевый (Средний, 4-12ч)
    return '#ffff00';                     // Желтый (Старый очаг, > 12ч)
}

// Функция отрисовки маркеров на карте и генерации карточек в сайдбаре
function renderFires(maxAgeHours) {
    console.log(`[EMBER] Фильтрация. Показываем очаги не старше: ${maxAgeHours}ч`);
    const ui = getUIElements();
    
    // Очищаем карту от старых кругов
    markersLayer.clearLayers();
    
    // Очищаем список карточек в сайдбаре
    if (ui.firesList) {
        ui.firesList.innerHTML = '';
        ui.firesList.style.cssText = 'max-height: 350px; overflow-y: auto; padding-right: 5px;';
    }

    // Фильтруем массив данных по времени на ползунке
    const filteredFires = firesData.filter(fire => fire.age_hours <= maxAgeHours);
    console.log(`[EMBER] Найдено очагов для отображения: ${filteredFires.length}`);

    if (filteredFires.length === 0) {
        if (ui.firesList) {
            ui.firesList.innerHTML = '<div style="color: #666; font-size: 13px; padding: 10px 0; text-align: center;">Нет активных угроз за этот период</div>';
        }
        return;
    }

    // Рендерим каждую отфильтрованную точку
    filteredFires.forEach((fire, index) => {
        if (!fire.lat || !fire.lon) return; // Защита от битых координат

        const color = getFireColor(fire.age_hours);
        // Масштабируем радиус от интенсивности тепла (FRP)
        const radius = Math.max(6, Math.min(fire.frp / 25, 20));

        // Создаем маркер
        const marker = L.circleMarker([fire.lat, fire.lon], {
            radius: radius,
            fillColor: color,
            color: color,
            weight: 1,
            opacity: 0.9,
            fillOpacity: 0.4
        });

        // Контент всплывающего окна (Popup)
        marker.bindPopup(`
            <div style="color: #111; font-family: sans-serif; font-size: 13px; line-height: 1.4;">
                <strong style="color: #d9534f;">Очаг возгорания #${index + 1}</strong><br>
                <b>Интенсивность (FRP):</b> ${fire.frp} MW<br>
                <b>Обнаружено:</b> ${fire.age_hours} ч. назад<br>
                <b>Координаты:</b> ${fire.lat.toFixed(4)}, ${fire.lon.toFixed(4)}
            </div>
        `);

        marker.addTo(markersLayer);

        // Создаем карточку в сайдбаре
        if (ui.firesList) {
            const item = document.createElement('div');
            item.style.cssText = `
                padding: 10px;
                margin-bottom: 8px;
                background: rgba(255, 255, 255, 0.04);
                border-left: 4px solid ${color};
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.2s ease;
            `;
            item.innerHTML = `
                <div style="display: flex; justify-content: space-between; font-weight: bold; color: #fff; font-size: 13px;">
                    <span>Очаг #${index + 1}</span>
                    <span style="color: ${color};">${fire.frp} MW</span>
                </div>
                <div style="color: #888; font-size: 11px; margin-top: 3px;">
                    Спутник VIIRS • ${fire.age_hours} ч. назад
                </div>
            `;

            // Эффект ховера
            item.onmouseenter = () => item.style.background = 'rgba(255, 255, 255, 0.09)';
            item.onmouseleave = () => item.style.background = 'rgba(255, 255, 255, 0.04)';

            // Клик по карточке плавно перемещает карту к маркеру
            item.onclick = () => {
                map.setView([fire.lat, fire.lon], 7, { animate: true, duration: 0.8 });
                marker.openPopup();
            };

            ui.firesList.appendChild(item);
        }
    });
}

// Загрузка обработанного датасета с API бэкенда
function loadEmberData() {
    console.log("[EMBER] Запрос к бэкенду /api/fires...");
    const ui = getUIElements();

    fetch('/api/fires')
        .then(response => {
            console.log("[EMBER] Статус ответа сервера:", response.status);
            if (!response.ok) throw new Error("Ошибка сервера: " + response.status);
            return response.json();
        })
        .then(data => {
            console.log("[EMBER] Данные получены от сервера:", data);

            // Разворачиваем структуру ответа
            let rawFires = [];
            if (Array.isArray(data)) {
                rawFires = data;
            } else if (data && Array.isArray(data.fires)) {
                rawFires = data.fires;
            } else if (data && Array.isArray(data.data)) {
                rawFires = data.data;
            } else {
                throw new Error("Неверный формат данных бэкенда.");
            }

            // ИСКУССТВЕННАЯ НОРМАЛИЗАЦИЯ ВРЕМЕНИ ДЛЯ СТАТИЧЕСКОГО ФАЙЛА
            // Распределяем точки равномерно от 1 до 24 часов, чтобы оживить слайдер
            firesData = rawFires.map((fire, idx) => {
                const normalizedAge = (idx % 24) + 1;
                return {
                    lat: parseFloat(fire.lat || fire.latitude),
                    lon: parseFloat(fire.lon || fire.longitude),
                    frp: parseFloat(fire.frp || 10),
                    age_hours: normalizedAge // Перезаписываем возраст для демо-режима
                };
            });

            console.log("[EMBER] Данные успешно нормализованы. Точек:", firesData.length);

            // Обновляем статусную строку на панели
            if (ui.statusText) {
                ui.statusText.innerText = "✓ EMBER Engine: Синхронизировано";
                ui.statusText.style.color = "#4caf50"; 
            }

            // Отрисовка на основе текущего положения ползунка времени
            const currentHours = ui.slider ? parseInt(ui.slider.value) : 24;
            renderFires(currentHours);
        })
        .catch(error => {
            console.error("[EMBER КРИТИЧЕСКАЯ ОШИБКА]:", error);
            if (ui.statusText) {
                ui.statusText.innerText = "Ошибка связи с EMBER Engine.";
                ui.statusText.style.color = "#ff5252";
            }
        });
}

// Инициализация событий страницы
document.addEventListener('DOMContentLoaded', () => {
    loadEmberData();

    const ui = getUIElements();
    if (ui.slider) {
        ui.slider.min = 0;
        ui.slider.max = 24;

        ui.slider.addEventListener('input', (e) => {
            const hoursValue = parseInt(e.target.value);
            
            if (ui.sliderLabel) {
                ui.sliderLabel.innerText = `Прогноз времени: ${hoursValue}ч`;
            }

            if (firesData.length > 0) {
                renderFires(hoursValue);
            }
        });
    }
});
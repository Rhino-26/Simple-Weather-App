/**
 * Atmospheric - Premium Weather App
 * Features: City Search, Geolocation, Unit Conversion, Map Integration
 * Powered by Open-Meteo (Weather) and Nominatim (Geocoding) - No API Key Required!
 */

// --- Configuration & Constants ---
const UI = {
    cityInput: document.getElementById('city-input'),
    searchBtn: document.getElementById('search-btn'),
    locationBtn: document.getElementById('location-btn'),
    weatherContent: document.getElementById('weather-content'),
    loader: document.getElementById('loader'),
    errorMessage: document.getElementById('error-message'),
    errorText: document.getElementById('error-text'),
    
    // Display Elements
    cityName: document.getElementById('name-span'),
    mainTemp: document.getElementById('main-temp'),
    weatherDesc: document.getElementById('weather-desc'),
    feelsLike: document.getElementById('feels-like'),
    weatherIcon: document.getElementById('weather-icon'),
    pressure: document.getElementById('pressure'),
    humidity: document.getElementById('humidity-val'),
    windSpeed: document.getElementById('wind-val'),
    windDirDesc: document.getElementById('wind-dir-desc'),
    googleMap: document.getElementById('google-map'),
    navLocation: document.getElementById('nav-location'),
    currentLocNav: document.getElementById('current-loc-nav'),
    
    // Unit Toggles
    unitC: document.getElementById('unit-c'),
    unitF: document.getElementById('unit-f')
};

let currentData = null;
let currentUnit = 'C'; // 'C' for Celsius, 'F' for Fahrenheit

// --- Weather Code Mapping (WMO to Description & Icon) ---
const weatherMap = {
    0: { desc: 'Clear Sky', icon: '01d', color: '#fbc02d' },
    1: { desc: 'Mainly Clear', icon: '01d', color: '#fbc02d' },
    2: { desc: 'Partly Cloudy', icon: '02d', color: '#90a4ae' },
    3: { desc: 'Overcast', icon: '03d', color: '#78909c' },
    45: { desc: 'Foggy', icon: '50d', color: '#b0bec5' },
    48: { desc: 'Rime Fog', icon: '50d', color: '#b0bec5' },
    51: { desc: 'Light Drizzle', icon: '09d', color: '#4fc3f7' },
    53: { desc: 'Moderate Drizzle', icon: '09d', color: '#29b6f6' },
    55: { desc: 'Dense Drizzle', icon: '09d', color: '#039be5' },
    61: { desc: 'Slight Rain', icon: '10d', color: '#4fc3f7' },
    63: { desc: 'Moderate Rain', icon: '10d', color: '#039be5' },
    65: { desc: 'Heavy Rain', icon: '10d', color: '#0277bd' },
    71: { desc: 'Slight Snow', icon: '13d', color: '#fff' },
    73: { desc: 'Moderate Snow', icon: '13d', color: '#fff' },
    75: { desc: 'Heavy Snow', icon: '13d', color: '#fff' },
    95: { desc: 'Thunderstorm', icon: '11d', color: '#5e35b1' },
    // Fallback
    'default': { desc: 'Cloudy', icon: '03d', color: '#78909c' }
};

// --- Initialization ---
window.addEventListener('DOMContentLoaded', () => {
    // Check local storage for last searched city
    const lastCity = localStorage.getItem('lastCity');
    if (lastCity) {
        getWeatherByCity(lastCity);
    } else {
        // Auto-detect location on first load
        autoDetectLocation();
    }
    
    setupEventListeners();
});

function setupEventListeners() {
    UI.searchBtn.addEventListener('click', () => {
        const city = UI.cityInput.value.trim();
        if (city) getWeatherByCity(city);
    });

    UI.cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const city = UI.cityInput.value.trim();
            if (city) getWeatherByCity(city);
        }
    });

    UI.locationBtn.addEventListener('click', autoDetectLocation);

    UI.unitC.addEventListener('click', () => setUnit('C'));
    UI.unitF.addEventListener('click', () => setUnit('F'));
}

// --- Core Logic ---

async function getWeatherByCity(city) {
    showLoader();
    try {
        // Step 1: Geocoding (City name to Lat/Lon)
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`);
        const geoData = await geoRes.json();

        if (!geoData || geoData.length === 0) {
            throw new Error('City not found. Try a different name.');
        }

        const { lat, lon, display_name } = geoData[0];
        const cityName = display_name.split(',')[0];
        const countryCode = display_name.split(',').pop().trim();

        // Step 2: Fetch Weather Data
        await fetchWeatherData(lat, lon, `${cityName}, ${countryCode}`);
        
        // Save to local storage
        localStorage.setItem('lastCity', city);
    } catch (error) {
        showError(error.message);
    }
}

async function fetchWeatherData(lat, lon, displayName) {
    showLoader();
    try {
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relativehumidity_2m,surface_pressure&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;
        const response = await fetch(weatherUrl);
        const data = await response.json();

        if (!data.current_weather) throw new Error('Weather data unavailable.');

        currentData = {
            displayName,
            lat,
            lon,
            temp: data.current_weather.temperature,
            windSpeed: data.current_weather.windspeed,
            windDir: data.current_weather.winddirection,
            weatherCode: data.current_weather.weathercode,
            // Since Open-Meteo hourly returns arrays, we pick the current hour's value or index-0 for simplicity
            pressure: data.hourly.surface_pressure[0],
            humidity: data.hourly.relativehumidity_2m[0]
        };

        updateUI();
    } catch (error) {
        showError('Failed to fetch weather data.');
    }
}

function updateUI() {
    if (!currentData) return;

    const weather = weatherMap[currentData.weatherCode] || weatherMap['default'];
    
    // Set Text Content
    UI.cityName.textContent = currentData.displayName;
    UI.weatherDesc.textContent = weather.desc;
    UI.weatherDesc.style.color = weather.color || '#e63946';
    UI.pressure.textContent = Math.round(currentData.pressure);
    UI.humidity.textContent = `${currentData.humidity}%`;
    UI.windSpeed.textContent = `${currentData.windSpeed}km/h`;
    
    // Wind Direction Description
    UI.windDirDesc.textContent = `Blowing from ${getWindDirection(currentData.windDir)}`;

    // Update Nav Location Tag
    if (UI.navLocation) {
        UI.navLocation.classList.remove('hidden');
        UI.currentLocNav.textContent = currentData.displayName.split(',')[0];
    }

    // Icon (Mapping WMO to OpenWeatherMap-style icons for beauty)
    UI.weatherIcon.src = `https://openweathermap.org/img/wn/${weather.icon}@4x.png`;
    
    // Update Temperature based on unit
    renderTemperature();

    // Update Map
    UI.googleMap.src = `https://www.google.com/maps?q=${currentData.lat},${currentData.lon}&output=embed&z=12`;

    // Visual Background Change Example (Subtle)
    document.querySelector('.weather-icon-card').style.background = `radial-gradient(circle at center, ${weather.color}22, #f8f9fa)`;

    hideLoader();
}

function renderTemperature() {
    let displayTemp = currentData.temp;
    let feelsLike = currentData.temp - 2; // Mock feels like logic for simplicity

    if (currentUnit === 'F') {
        displayTemp = (displayTemp * 9/5) + 32;
        feelsLike = (feelsLike * 9/5) + 32;
    }

    UI.mainTemp.textContent = Math.round(displayTemp);
    UI.feelsLike.textContent = `Feels like ${Math.round(feelsLike)}°`;
}

function setUnit(unit) {
    if (currentUnit === unit) return;
    currentUnit = unit;
    
    UI.unitC.classList.toggle('active', unit === 'C');
    UI.unitF.classList.toggle('active', unit === 'F');
    
    if (currentData) renderTemperature();
}

// --- Helpers ---

function autoDetectLocation() {
    if (navigator.geolocation) {
        showLoader();
        navigator.geolocation.getCurrentPosition(
            (position) => {
                fetchWeatherData(position.coords.latitude, position.coords.longitude, "Current Location");
            },
            () => {
                // Fallback to a default city if denied
                getWeatherByCity('New York');
            }
        );
    } else {
        getWeatherByCity('London');
    }
}

function getWindDirection(degree) {
    const directions = ['North', 'North-East', 'East', 'South-East', 'South', 'South-West', 'West', 'North-West'];
    const index = Math.round(degree / 45) % 8;
    return directions[index];
}

function showLoader() {
    UI.weatherContent.classList.add('hidden');
    UI.errorMessage.classList.add('hidden');
    UI.loader.classList.remove('hidden');
}

function hideLoader() {
    UI.loader.classList.add('hidden');
    UI.weatherContent.classList.remove('hidden');
}

function showError(message) {
    UI.loader.classList.add('hidden');
    UI.weatherContent.classList.add('hidden');
    UI.errorMessage.classList.remove('hidden');
    UI.errorText.textContent = message;
}

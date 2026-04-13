# Atmospheric Weather App

A premium, modern weather forecasting application built with Vanilla HTML, CSS, and JavaScript.

## Features
- **Real-time Data**: Fetches live weather data using the Open-Meteo API.
- **City Search**: Search for any city worldwide using the Nominatim Geocoding API.
- **Auto-Location**: Detects your current location automatically on first load.
- **Unit Conversion**: Toggle seamlessly between Celsius (°C) and Fahrenheit (°F).
- **Google Maps Integration**: View the live location of the searched city on an interactive map.
- **Premium UI**: Inspired by high-end weather dashboards with a clean, responsive design.
- **Persistence**: Remembers your last searched city using Local Storage.

## APIs Used
1.  **[Open-Meteo](https://open-meteo.com/)**: For weather data (no API key required).
2.  **[Nominatim (OpenStreetMap)](https://nominatim.org/)**: For geocoding city names to coordinates.
3.  **[Google Maps](https://www.google.com/maps)**: For location visualization via iframe.

## How to Run
1.  Navigate to the `Weather App` folder.
2.  Open `index.html` in any modern web browser.
3.  (Optional) Serve it via a local server (like Live Server in VS Code) for the best experience with Geolocation.

## Project Structure
- `index.html`: The semantic structure of the application.
- `style.css`: Modern styling with glassmorphism and responsive grid systems.
- `script.js`: Core logic for fetching data, updating the UI, and handling interactions.

// --- MAIN APPLICATION MODULE (apps/apps.js) ---

import { saveLastCity, getLastCity, toggleFavorite, getFavoriteCity } from './storage.js'; 

// ===========================================
// 1. CONFIGURATION & DOM ELEMENTS
// ===========================================

// IMPORTANT: FOR TESTING ONLY: Use your actual key here. 
// REPLACE with a placeholder (e.g., 'YOUR_API_KEY_HERE') before committing to GitHub.
const API_KEY = 'e49c5df5ed882ea60e4603c9123e0d04'; 
const BASE_URL = 'https://api.openweathermap.org/data/2.5/';

// Get all necessary DOM elements
const locationDisplay = document.getElementById('locationDisplay');
const weatherInfo = document.getElementById('weatherInfo');
const forecastGrid = document.getElementById('forecastGrid');
const errorMessage = document.getElementById('errorMessage');
const searchInput = document.getElementById('searchInput');
const searchIcon = document.getElementById('searchIcon');
const currentIcon = document.getElementById('currentIcon');
const favoriteIcon = document.getElementById('favoriteIcon'); // Added for favorite feature

// Default/Fallback city
const DEFAULT_CITY = 'Stockton';


// ===========================================
// 2. UTILITY & UI FUNCTIONS
// ===========================================

/**
 * Maps OpenWeatherMap codes to emoji icons.
 */
function getWeatherIcon(code) {
    if (code >= 200 && code < 300) return '⛈️'; // Thunderstorm
    if (code >= 300 && code < 400) return '🌦️'; // Drizzle
    if (code >= 500 && code < 600) return '🌧️'; // Rain
    if (code >= 600 && code < 700) return '❄️'; // Snow
    if (code >= 700 && code < 800) return '🌫️'; // Atmosphere
    if (code === 800) return '☀️'; // Clear
    if (code === 801) return '🌤️'; // Few clouds
    if (code === 802) return '⛅'; // Scattered clouds
    if (code >= 803) return '☁️'; // Clouds
    return '🌡️';
}

function displayError(message) {
    console.error("API Fetch Error:", message);
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 5000);
}

function clearError() {
    errorMessage.style.display = 'none';
}


// ===========================================
// 3. API FETCHING LOGIC
// ===========================================

/**
 * Fetches current weather data for a given city name.
 */
async function fetchCurrentWeather(city) {
    console.log(`Fetching current weather for: ${city}...`);
    try {
        clearError();
        const url = `${BASE_URL}weather?q=${city}&units=imperial&appid=${API_KEY}`;
        const response = await fetch(url);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`City "${city}" not found.`);
            }
            throw new Error(`Weather data not available. Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("✅ Current Weather Data Fetched:", data);
        return data;
    } catch (error) {
        displayError(error.message);
        return null;
    }
}

/**
 * Fetches forecast data for a given city name.
 */
async function fetchForecast(city) {
    console.log(`Fetching 5-day/3-hour forecast data for: ${city}...`);
    try {
        clearError();
        const url = `${BASE_URL}forecast?q=${city}&units=imperial&appid=${API_KEY}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Forecast data not available. Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("✅ Forecast Data Fetched:", data);
        return data;
    } catch (error) {
        displayError(error.message);
        return null;
    }
}

/**
 * Fetches current weather data using coordinates (lat, lon).
 */
async function fetchWeatherByCoords(lat, lon) {
    console.log(`Fetching weather for coordinates: Lat=${lat}, Lon=${lon}...`);
    try {
        clearError();
        const url = `${BASE_URL}weather?lat=${lat}&lon=${lon}&units=imperial&appid=${API_KEY}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Current weather data not available for this location.`);
        }

        const data = await response.json();
        console.log("✅ Current Weather Data Fetched by Coords:", data);
        return data;
    } catch (error) {
        displayError(error.message);
        return null;
    }
}


// ===========================================
// 4. DATA RENDERING
// ===========================================

function displayCurrentWeather(data) {
    const temp = Math.round(data.main.temp);
    const tempHigh = Math.round(data.main.temp_max);
    const tempLow = Math.round(data.main.temp_min);
    
    // Capitalize the first letter of each word in the description
    const condition = data.weather[0].description
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    
    // ------------------------------------------------------------------
    // 1. POPULATE THE CURRENT WEATHER CARD (FIXED SECTION)
    // ------------------------------------------------------------------
    
    locationDisplay.textContent = `${data.name}, ${data.sys.country}`;
    document.getElementById('currentTemp').textContent = `${temp}°`;
    document.getElementById('tempHigh').textContent = `${tempHigh}°`;
    document.getElementById('tempLow').textContent = `${tempLow}°`;
    weatherInfo.textContent = condition;
    currentIcon.textContent = getWeatherIcon(data.weather[0].id);
    
    saveLastCity(data.name);

    // ------------------------------------------------------------------
    // 2. FAVORITE CITY LOGIC
    // ------------------------------------------------------------------
    const favoriteCityName = getFavoriteCity();
    const isFavorite = favoriteCityName === data.name;

    if (isFavorite) {
        favoriteIcon.classList.add('is-favorite');
    } else {
        favoriteIcon.classList.remove('is-favorite');
    }
    
    favoriteIcon.dataset.cityName = data.name; 
}

function displayForecast(data) {
    forecastGrid.innerHTML = '';

    // Extract up to 7 daily forecasts (one per day)
    const dailyForecasts = [];
    const seenDates = new Set();

    for (let item of data.list) {
        const date = new Date(item.dt * 1000);
        // Use a simple date string to track unique days
        const dateStr = date.toLocaleDateString('en-US', { day: 'numeric', month: 'numeric' });

        if (!seenDates.has(dateStr) && dailyForecasts.length < 7) {
            seenDates.add(dateStr);
            dailyForecasts.push(item);
        }
    }

    dailyForecasts.forEach((day) => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
        const temp = Math.round(day.main.temp);
        const tempMin = Math.round(day.main.temp_min);
        const icon = getWeatherIcon(day.weather[0].id);

        const card = document.createElement('div');
        card.classList.add('forecast-card');
        card.innerHTML = `
            <div class="day-label">${dayName}</div>
            <div class="forecast-icon">${icon}</div>
            <div class="temp-main">${temp}°</div>
            <div class="temp-min">${tempMin}°</div>
        `;
        forecastGrid.appendChild(card);
    });
}


// ===========================================
// 5. MAIN CONTROL FLOW
// ===========================================

/**
 * General function to fetch and display weather for a city name.
 */
async function loadWeatherData(city) {
    const currentData = await fetchCurrentWeather(city);
    const forecastData = await fetchForecast(city);

    if (currentData) {
        displayCurrentWeather(currentData);
    }

    if (forecastData) {
        displayForecast(forecastData);
    }
}

function handleSearch() {
    const city = searchInput.value.trim();

    if (city) {
        loadWeatherData(city);
        searchInput.value = '';
    } else {
        displayError("Please enter a city name");
    }
}

/**
 * Requests user permission for location and fetches weather based on coordinates,
 * with fallback to the last saved city if permission is denied.
 */
function getGeolocation() {
    locationDisplay.textContent = "Locating you...";
    if (navigator.geolocation) {
        // Request the current position
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                // Success: Fetch weather by coordinates
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                const currentData = await fetchWeatherByCoords(lat, lon);

                if (currentData) {
                    // Use the city name from currentData to fetch forecast
                    const forecastData = await fetchForecast(currentData.name);

                    displayCurrentWeather(currentData);
                    if (forecastData) {
                        displayForecast(forecastData);
                    }
                }
            },
            (error) => {
                // Error/Denied: Fallback to last saved city
                console.warn(`Geolocation failed: ${error.message}. Falling back to saved city.`);
                const cityToLoad = getLastCity() || DEFAULT_CITY;
                loadWeatherData(cityToLoad);
            }
        );
    } else {
        // Unsupported: Fallback to last saved city
        displayError("Geolocation is not supported by this browser. Using last saved city.");
        const cityToLoad = getLastCity() || DEFAULT_CITY;
        loadWeatherData(cityToLoad);
    }
}


// ===========================================
// 6. INITIALIZATION & EVENT LISTENERS
// ===========================================

function handleFavoriteClick(e) {
    // 1. Get the city name from the data attribute we set earlier
    const city = favoriteIcon.dataset.cityName;
    if (!city) return;

    // 2. Check current state: if it has the class, it is currently a favorite
    const isCurrentlyFavorite = favoriteIcon.classList.contains('is-favorite');

    if (isCurrentlyFavorite) {
        // If it is a favorite, un-favorite it
        favoriteIcon.classList.remove('is-favorite');
        toggleFavorite(city, false);
    } else {
        // If it is not a favorite, mark it as favorite
        favoriteIcon.classList.add('is-favorite');
        toggleFavorite(city, true);
    }
}

function setupEventListeners() {
    searchIcon.addEventListener('click', handleSearch);
    favoriteIcon.addEventListener('click', handleFavoriteClick);

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
}

function initApp() {
    setupEventListeners();
    
    // Start by trying to get geolocation
    getGeolocation();
}

document.addEventListener('DOMContentLoaded', initApp);
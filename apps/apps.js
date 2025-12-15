// --- MAIN APPLICATION MODULE (apps/apps.js) ---

import { saveLastCity, getLastCity } from './storage.js';

// --- 1. CONFIGURATION ---
// IMPORTANT: Replace this with your actual OpenWeatherMap API Key
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

// Global state to track the current city
let currentCity = 'Stockton';

// --- 2. UTILITY FUNCTIONS ---

/**
 * Maps weather condition codes to emoji icons
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

// --- 3. FETCHING DATA (REQUIRED ASSIGNMENT POINT: Console Fetches) ---

/**
 * Fetches current weather data for a given city and logs to console.
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
 * Fetches forecast data for a given city and logs to console.
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

// --- 4. RENDERING DATA ---

function displayCurrentWeather(data) {
    const temp = Math.round(data.main.temp);
    const tempHigh = Math.round(data.main.temp_max);
    const tempLow = Math.round(data.main.temp_min);
    
    // Capitalize the first letter of each word in the description
    const condition = data.weather[0].description
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    
    locationDisplay.textContent = `${data.name}, ${data.sys.country}`;
    document.getElementById('currentTemp').textContent = `${temp}°`;
    document.getElementById('tempHigh').textContent = `${tempHigh}°`;
    document.getElementById('tempLow').textContent = `${tempLow}°`;
    weatherInfo.textContent = condition;
    currentIcon.textContent = getWeatherIcon(data.weather[0].id);
    
    currentCity = data.name;
    saveLastCity(data.name);
}

function displayForecast(data) {
    forecastGrid.innerHTML = '';
    
    // Extract up to 7 daily forecasts
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

// --- 5. MAIN CONTROL FLOW ---

function handleSearch() {
    const city = searchInput.value.trim();
    
    if (city) {
        loadWeather(city);
        searchInput.value = ''; 
    } else {
        displayError("Please enter a city name");
    }
}

async function loadWeather(city) {
    const currentData = await fetchCurrentWeather(city);
    const forecastData = await fetchForecast(city);
    
    if (currentData) {
        displayCurrentWeather(currentData);
    }
    
    if (forecastData) {
        displayForecast(forecastData);
    }
}

// --- 6. EVENT LISTENERS AND INITIALIZATION ---

function setupEventListeners() {
    searchIcon.addEventListener('click', handleSearch);
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
}

function initApp() {
    setupEventListeners();
    
    const lastSavedCity = getLastCity();
    const cityToLoad = lastSavedCity || currentCity;
    
    loadWeather(cityToLoad);
}

document.addEventListener('DOMContentLoaded', initApp);
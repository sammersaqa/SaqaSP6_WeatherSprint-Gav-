// --- MAIN APPLICATION MODULE ---

import { saveLastCity, getLastCity } from './storage.js';

// --- 1. CONFIGURATION ---
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
 * @param {number} code - Weather condition code from API
 * @returns {string} Weather emoji
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

/**
 * Displays an error message to the user
 * @param {string} message - Error message to display
 */
function displayError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 5000);
}

/**
 * Clears any displayed error messages
 */
function clearError() {
    errorMessage.style.display = 'none';
}

// --- 3. FETCHING DATA ---

/**
 * Fetches current weather data for a given city
 * @param {string} city - City name to fetch weather for
 * @returns {Promise<Object|null>} Weather data or null if error
 */
async function fetchCurrentWeather(city) {
    try {
        clearError();
        const response = await fetch(
            `${BASE_URL}weather?q=${city}&units=imperial&appid=${API_KEY}`
        );
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`City "${city}" not found.`);
            }
            throw new Error(`Weather data not available`);
        }
        
        return await response.json();
    } catch (error) {
        displayError(error.message);
        return null;
    }
}

/**
 * Fetches 5-day forecast data for a given city
 * NOTE: OpenWeather's free '/forecast' endpoint provides 5 days (40 timestamps).
 * To get a true 7-day forecast, you would need their commercial 'onecall' endpoint
 * or a different API. We will extract the first 7 available days from the 5-day
 * data, which usually covers about 5-6 full days plus the current partial day.
 * * @param {string} city - City name to fetch forecast for
 * @returns {Promise<Object|null>} Forecast data or null if error
 */
async function fetchForecast(city) {
    try {
        clearError();
        const response = await fetch(
            `${BASE_URL}forecast?q=${city}&units=imperial&appid=${API_KEY}`
        );
        
        if (!response.ok) {
            throw new Error(`Forecast data not available`);
        }
        
        return await response.json();
    } catch (error) {
        displayError(error.message);
        return null;
    }
}

// --- 4. RENDERING DATA ---

/**
 * Displays the current weather data in the card
 * @param {Object} data - Weather data from API
 */
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
    
    // Save the successfully loaded city to global state and storage
    currentCity = data.name;
    saveLastCity(data.name);
}

/**
 * Displays the 5-day forecast, modified to show the first 7 distinct days possible
 * @param {Object} data - Forecast data from API
 */
function displayForecast(data) {
    forecastGrid.innerHTML = '';
    
    // Get up to 7 daily forecasts (one per day)
    const dailyForecasts = [];
    const seenDates = new Set();
    
    for (let item of data.list) {
        const date = new Date(item.dt * 1000);
        const dateStr = date.toLocaleDateString('en-US', { day: 'numeric', month: 'numeric' });
        
        // Only include the first data point for each unique date, up to 7
        if (!seenDates.has(dateStr) && dailyForecasts.length < 7) {
            seenDates.add(dateStr);
            dailyForecasts.push(item);
        }
    }
}

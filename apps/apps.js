import { saveCityToRecents, getRecentCities, toggleFavorite, getFavoriteCity } from './storage.js';

const API_KEY = 'e49c5df5ed882ea60e4603c9123e0d04';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/';

const locationDisplay = document.getElementById('locationDisplay');
const weatherInfo = document.getElementById('weatherInfo');
const forecastGrid = document.getElementById('forecastGrid');
const errorMessage = document.getElementById('errorMessage');
const searchInput = document.getElementById('searchInput');
const searchIcon = document.getElementById('searchIcon');
const currentIcon = document.getElementById('currentIcon');
const favoriteIcon = document.getElementById('favoriteIcon');
const recentSearchesDropdown = document.getElementById('recentSearchesDropdown');

const DEFAULT_CITY = 'Stockton';

function getWeatherIcon(code) {
    if (code >= 200 && code < 300) return '⛈️';
    if (code >= 300 && code < 400) return '🌦️';
    if (code >= 500 && code < 600) return '🌧️';
    if (code >= 600 && code < 700) return '❄️';
    if (code >= 700 && code < 800) return '🌫️';
    if (code === 800) return '☀️';
    if (code === 801) return '🌤️';
    if (code === 802) return '⛅';
    if (code >= 803) return '☁️';
    return '🌡️';
}

function displayError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    setTimeout(() => errorMessage.style.display = 'none', 5000);
}

async function getState(lat, lon) {
    try {
        const geoUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`;
        const res = await fetch(geoUrl);
        const data = await res.json();
        return data[0]?.state || data[0]?.country || "";
    } catch (err) {
        return "";
    }
}

async function fetchCurrentWeather(city) {
    try {
        errorMessage.style.display = 'none';
        const url = `${BASE_URL}weather?q=${city}&units=imperial&appid=${API_KEY}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(response.status === 404 ? `City "${city}" not found.` : "Weather error");
        }
        return await response.json();
    } catch (error) {
        displayError(error.message);
        return null;
    }
}

async function fetchForecast(lat, lon) { 
    try {
        const url = `${BASE_URL}forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${API_KEY}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Forecast failed");
        return await response.json();
    } catch (error) {
        return null;
    }
}

async function fetchWeatherByCoords(lat, lon) {
    try {
        const url = `${BASE_URL}weather?lat=${lat}&lon=${lon}&units=imperial&appid=${API_KEY}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Coord fetch failed");
        return await response.json();
    } catch (error) {
        return null;
    }
}

function displayCurrentWeather(data, state) {
    const temp = Math.round(data.main.temp);
    const high = Math.round(data.main.temp_max);
    const low = Math.round(data.main.temp_min);

    const condition = data.weather[0].description
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

    const place = state || data.sys.country;
    locationDisplay.textContent = `${data.name}, ${place}`;

    document.getElementById('currentTemp').textContent = `${temp}°`;
    document.getElementById('tempHigh').textContent = `${high}°`;
    document.getElementById('tempLow').textContent = `${low}°`;
    weatherInfo.textContent = condition;
    currentIcon.textContent = getWeatherIcon(data.weather[0].id);

    saveCityToRecents(data.name);

    const favName = getFavoriteCity();
    favoriteIcon.classList.toggle('is-favorite', favName === data.name);
    favoriteIcon.dataset.cityName = data.name;
}

function displayForecast(data) {
    forecastGrid.innerHTML = '';
    const days = [];
    const usedDates = new Set();

    for (let item of data.list) {
        const d = new Date(item.dt * 1000);
        const dStr = d.toLocaleDateString('en-US', { day: 'numeric', month: 'numeric' });

        if (!usedDates.has(dStr) && days.length < 7) {
            usedDates.add(dStr);
            days.push(item);
        }
    }

    days.forEach((day) => {
        const d = new Date(day.dt * 1000);
        const name = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
        
        const card = document.createElement('div');
        card.className = 'forecast-card';
        card.innerHTML = `
            <div class="day-label">${name}</div>
            <div class="forecast-icon">${getWeatherIcon(day.weather[0].id)}</div>
            <div class="temp-main">${Math.round(day.main.temp)}°</div>
            <div class="temp-min">${Math.round(day.main.temp_min)}°</div>
        `;
        forecastGrid.appendChild(card);
    });
}

function renderRecentSearches() {
    recentSearchesDropdown.innerHTML = '';
    let cities = getRecentCities();
    if (cities.length === 0) cities = [DEFAULT_CITY];

    cities.forEach(city => {
        const isFav = getFavoriteCity() === city;
        const item = document.createElement('div');
        item.className = 'recent-search-item';
        item.dataset.cityName = city;

        item.innerHTML = `
            <span class="dropdown-city-text">${city}</span>
            <i class="fa-solid fa-heart dropdown-favorite-icon ${isFav ? 'is-favorite' : ''}"></i>
        `;

        item.addEventListener('click', (e) => {
            if (!e.target.classList.contains('dropdown-favorite-icon')) {
                loadWeatherData(city);
                recentSearchesDropdown.style.display = 'none';
            }
        });

        item.querySelector('.dropdown-favorite-icon').addEventListener('click', handleDropdownFavoriteClick);
        recentSearchesDropdown.appendChild(item);
    });
}

async function loadWeatherData(city) {
    const cur = await fetchCurrentWeather(city);
    
    if (cur) {
        const stateName = await getState(cur.coord.lat, cur.coord.lon);
        const fore = await fetchForecast(cur.coord.lat, cur.coord.lon);
        
        displayCurrentWeather(cur, stateName);
        if (fore) displayForecast(fore);
    }
}

function handleSearch() {
    const input = searchInput.value.trim();
    
    if (!input) {
        displayError("Please enter a city or lat, lon");
        return;
    }

    // Check if input is "latitude, longitude" (numbers and a comma)
    const coordPattern = /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/;
    
    if (coordPattern.test(input)) {
        // If it matches, split the numbers
        const [lat, lon] = input.split(',').map(num => num.trim());
        loadWeatherDataByCoords(lat, lon);
    } else {
        // Otherwise, treat it as a city name search
        const city = input.replace(/[^a-zA-Z0-9,\s]/g, '');
        loadWeatherData(city);
    }
    
    searchInput.value = '';
}

// New function specifically for when someone types lat/lon in the search bar
async function loadWeatherDataByCoords(lat, lon) {
    const cur = await fetchWeatherByCoords(lat, lon);
    const fore = await fetchForecast(lat, lon); // Use your updated forecast function
    const st = await getState(lat, lon);

    if (cur) {
        displayCurrentWeather(cur, st);
    }
    if (fore) {
        displayForecast(fore);
    }
}

function getGeolocation() {
    locationDisplay.textContent = "Locating you...";
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const { latitude, longitude } = pos.coords;
            const cur = await fetchWeatherByCoords(latitude, longitude);

            if (cur) {
                const fore = await fetchForecast(latitude, longitude);
                const st = await getState(latitude, longitude);
                
                displayCurrentWeather(cur, st);
                if (fore) displayForecast(fore);
            }
        }, () => {
            loadWeatherData(DEFAULT_CITY);
        });
    } else {
        loadWeatherData(DEFAULT_CITY);
    }
}

function handleFavoriteClick() {
    const city = favoriteIcon.dataset.cityName;
    if (!city) return;
    
    const isFav = favoriteIcon.classList.contains('is-favorite');
    toggleFavorite(city, !isFav);
    favoriteIcon.classList.toggle('is-favorite');
    
    if (recentSearchesDropdown.style.display === 'block') {
        renderRecentSearches();
    }
}

function handleDropdownFavoriteClick(e) {
    e.stopPropagation();
    const city = e.target.closest('.recent-search-item').dataset.cityName;
    const isFav = e.target.classList.contains('is-favorite');
    
    toggleFavorite(city, !isFav);
    renderRecentSearches();
    
    if (favoriteIcon.dataset.cityName === city) {
        favoriteIcon.classList.toggle('is-favorite', !isFav);
    }
}

function setupEventListeners() {
    searchIcon.addEventListener('click', handleSearch);
    favoriteIcon.addEventListener('click', handleFavoriteClick);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });

    searchInput.addEventListener('focus', () => {
        renderRecentSearches();
        recentSearchesDropdown.style.display = 'block';
    });

    searchInput.addEventListener('blur', () => {
        setTimeout(() => recentSearchesDropdown.style.display = 'none', 200);
    });
}

setupEventListeners();
getGeolocation();
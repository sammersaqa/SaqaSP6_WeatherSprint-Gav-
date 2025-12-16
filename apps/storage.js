// storage.js

const LAST_CITIES_KEY = 'weatherAppLastCities';
const FAVORITE_CITY_KEY = 'weatherAppFavoriteCity';
const MAX_CITIES = 5;

// === LAST 5 CITIES LOGIC ===

export function getRecentCities() {
    const citiesJson = localStorage.getItem(LAST_CITIES_KEY);
    // Returns an array or an empty array if nothing is saved
    return citiesJson ? JSON.parse(citiesJson) : [];
}

export function saveCityToRecents(city) {
    if (!city) return;

    // 1. Get the current list
    let cities = getRecentCities();

    // 2. Remove the city if it already exists (to move it to the front/most recent)
    cities = cities.filter(c => c.toLowerCase() !== city.toLowerCase());

    // 3. Add the new city to the front
    cities.unshift(city);

    // 4. Limit to MAX_CITIES (5)
    if (cities.length > MAX_CITIES) {
        cities = cities.slice(0, MAX_CITIES);
    }

    // 5. Save back to localStorage
    localStorage.setItem(LAST_CITIES_KEY, JSON.stringify(cities));
}

// === FAVORITE CITY LOGIC ===

export function getFavoriteCity() {
    return localStorage.getItem(FAVORITE_CITY_KEY);
}

export function toggleFavorite(city, isFavorite) {
    if (isFavorite) {
        localStorage.setItem(FAVORITE_CITY_KEY, city);
    } else {
        // Only remove if the city being toggled is the current favorite
        if (getFavoriteCity() === city) {
            localStorage.removeItem(FAVORITE_CITY_KEY);
        }
    }
}
// Note: You must update your apps.js imports to use saveCityToRecents and getRecentCities
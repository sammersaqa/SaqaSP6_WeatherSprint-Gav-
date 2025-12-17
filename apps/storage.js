// storage.js

const LAST_CITIES_KEY = 'weatherAppLastCities';
const FAVORITE_CITY_KEY = 'weatherAppFavoriteCity';
const MAX_CITIES = 5;

export function getRecentCities() {
    const saved = localStorage.getItem(LAST_CITIES_KEY);
    return saved ? JSON.parse(saved) : [];
}

export function saveCityToRecents(city) {
    if (!city) return;

    let cities = getRecentCities();
    
    // move this city to the top if it already exists
    cities = cities.filter(c => c.toLowerCase() !== city.toLowerCase());
    cities.unshift(city);

    // keep only the 5 most recent
    if (cities.length > MAX_CITIES) {
        cities = cities.slice(0, MAX_CITIES);
    }

    localStorage.setItem(LAST_CITIES_KEY, JSON.stringify(cities));
}

export function getFavoriteCity() {
    return localStorage.getItem(FAVORITE_CITY_KEY);
}

export function toggleFavorite(city, isFavorite) {
    if (isFavorite) {
        localStorage.setItem(FAVORITE_CITY_KEY, city);
    } else {
        // only clear if this city is currently the favorite
        if (getFavoriteCity() === city) {
            localStorage.removeItem(FAVORITE_CITY_KEY);
        }
    }
}
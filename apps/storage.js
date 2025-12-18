// storage.js

const LAST_CITIES_KEY = 'weatherAppLastCities';
const FAVORITES_KEY = 'weatherAppFavorites'; 
const MAX_CITIES = 5;

export function getRecentCities() {
    const saved = localStorage.getItem(LAST_CITIES_KEY);
    return saved ? JSON.parse(saved) : [];
}

export function saveCityToRecents(city) {
    if (!city) return;
    let cities = getRecentCities();
    
    cities = cities.filter(c => c.toLowerCase() !== city.toLowerCase());
    cities.unshift(city);

    if (cities.length > MAX_CITIES) {
        cities = cities.slice(0, MAX_CITIES);
    }
    localStorage.setItem(LAST_CITIES_KEY, JSON.stringify(cities));
}


export function getFavoriteCities() {
    const saved = localStorage.getItem(FAVORITES_KEY);
    return saved ? JSON.parse(saved) : [];
}


export function toggleFavorite(city) {
    let favorites = getFavoriteCities();
    
    if (favorites.includes(city)) {
        
        favorites = favorites.filter(c => c !== city);
    } else {
       
        favorites.push(city);
    }
    
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}


export function isCityFavorite(city) {
    return getFavoriteCities().includes(city);
}
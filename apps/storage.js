// --- STORAGE MODULE (apps/storage.js) ---

let memoryStorage = {
    lastCity: 'Stockton',
    favoriteCity: null 
};

/**
 * Saves the name of the last viewed city.
 */
export function saveLastCity(city) {
    memoryStorage.lastCity = city;
    console.log(`Storage: Saved last city as ${city}`);
}

/**
 * Retrieves the last viewed city.
 */
export function getLastCity() {
    return memoryStorage.lastCity || null;
}

/**
 * Toggles the favorite status of a city.
 */
export function toggleFavorite(city, isFavorite) {
    if (isFavorite) {
        memoryStorage.favoriteCity = city;
        console.log(`Storage: Set favorite city to ${city}`);
    } else {
        memoryStorage.favoriteCity = null;
        console.log(`Storage: Removed favorite city status for ${city}`);
    }
}

/**
 * Checks if the given city is the current favorite.
 */
export function getFavoriteCity() {
    return memoryStorage.favoriteCity;
}
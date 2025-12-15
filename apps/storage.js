// --- STORAGE MODULE (apps/storage.js) ---
// Uses in-memory storage for environment compatibility

let memoryStorage = {
    lastCity: 'Stockton'
};

/**
 * Saves the name of the last viewed city to memory storage.
 */
export function saveLastCity(city) {
    memoryStorage.lastCity = city;
    console.log(`Storage: Saved last city as ${city}`);
}

/**
 * Retrieves the last viewed city from memory storage.
 */
export function getLastCity() {
    return memoryStorage.lastCity || null;
}
// --- STORAGE MODULE ---
// Uses in-memory storage instead of localStorage (for Claude artifacts compatibility)

// In-memory storage object
let memoryStorage = {
    lastCity: 'Stockton'
};

/**
 * Saves the name of the last viewed city to memory storage.
 * @param {string} city - The name of the city to save (e.g., "Stockton").
 */
export function saveLastCity(city) {
    try {
        memoryStorage.lastCity = city;
        console.log(`Saved city: ${city}`);
    } catch (e) {
        console.error("Could not save city.", e);
    }
}

/**
 * Retrieves the last viewed city from memory storage.
 * @returns {string | null} The saved city name or null if no city is found.
 */
export function getLastCity() {
    try {
        return memoryStorage.lastCity || null;
    } catch (e) {
        console.error("Could not read from storage.", e);
        return null;
    }
}

/**
 * Clears the stored city from memory storage (optional function).
 */
export function clearLastCity() {
    try {
        memoryStorage.lastCity = null;
        console.log("Cleared last city");
    } catch (e) {
        console.error("Could not clear storage.", e);
    }
}
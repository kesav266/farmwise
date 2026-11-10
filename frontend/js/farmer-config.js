
/*
 * FarmWise AI configuration.
 * Do not store dealer, inventory, or store records here.
 */
window.FARMWISE_CONFIG = Object.freeze({
    apiBaseUrl: window.API_BASE_URL || (
        window.location.port === "5500"
            ? "http://127.0.0.1:8001"
            : ""
    ),

    lowStockThresholdKg: 100,
    earthRadiusKm: 6371,
    maxVoiceResults: 5,

    geolocation: Object.freeze({
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 60000
    })
});

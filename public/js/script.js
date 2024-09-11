// Initializing Socket.io on the client-side
const socket = io(); // Establishes a WebSocket connection with the server

// Checking if the browser supports Geolocation API
if(navigator.geolocation){
    // Continuously watch the user's position and send updates to the server
    navigator.geolocation.watchPosition(
        (position) => {
            // Extract latitude and longitude from the position object
            const { latitude, longitude } = position.coords;
            // Sending the current location (latitude, longitude) to the server via Socket.io
            socket.emit("send-location", { latitude, longitude });
        },
        (error) => {
            // Error handling for geolocation
            console.error(error);
        },
        {
            enableHighAccuracy: true, // Requests high-accuracy location data (using GPS)
            timeout: 5000, // Maximum wait time for a location response in milliseconds
            maximumAge: 0 // Ensures the browser doesn't use a cached position
        }
    );
}

// Initializing the Leaflet map
const map = L.map("map").setView([0,0], 16); // Creates a map centered at [0, 0] with a zoom level of 16

// Adding OpenStreetMap tiles to the map
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "atharviews" // Attributing the tile source (OpenStreetMap)
}).addTo(map); // Adds the tiles to the map

// Object to store all user markers by their socket ID
const markers = {};

// Listening for the "receive-location" event from the server
socket.on("receive-location", (data) => {
    const { id, latitude, longitude } = data; // Extract user ID and location data from the server's message
    map.setView([latitude, longitude]); // Update the map view to center on the received location

    // If the marker for the user already exists, update its position
    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]); // Move the existing marker to the new location
    }
    else {
        // If no marker exists for the user, create a new marker at the received location
        markers[id] = L.marker([latitude, longitude]).addTo(map); // Add the marker to the map
    }
});

// Listening for the "user-disconnected" event when a user disconnects
socket.on("user-disconnected", (id) => {
    if (markers[id]) {
        // If the user had a marker on the map, remove it
        map.removeLayer(markers[id]); // Remove the marker from the map
        delete markers[id]; // Delete the marker from the `markers` object
    }
});



// Geolocation API: The navigator.geolocation.watchPosition() function 
// continuously tracks the user's location and sends it to the server via Socket.io.
// Leaflet Map: The map is initialized at [0, 0] and uses OpenStreetMap tiles to display the map.
// Real-Time Tracking: When the server sends location updates via the "receive-location" event, 
// the corresponding marker is updated or added to the map. When a user disconnects, 
// their marker is removed from the map via the "user-disconnected" event.
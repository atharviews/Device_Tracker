// Importing required modules
const express = require('express'); // Express framework for handling server-side logic
const app = express(); // Initializing the Express application
const path = require("path"); // Path module for handling file and directory paths

// Setting up Socket.io for real-time communication
const http = require("http"); // HTTP module to create a basic web server
const socketio = require("socket.io"); // Socket.io for WebSocket-based real-time communication
const server = http.createServer(app); // Creating an HTTP server using Express as the request handler
const io = socketio(server); // Initializing Socket.io with the server to enable WebSocket communication

// Setting up the view engine and static files
app.set("view engine", "ejs"); // Setting EJS as the view engine to render dynamic HTML
app.set(express.static(path.join(__dirname, "public"))); // Defining the path to serve static files from the "public" directory
app.use(express.static('public')); // Middleware to serve static assets like CSS, JS from the "public" folder

// Socket.io event handlers
io.on("connection", function (socket) { // Listening for new WebSocket connections
    // Listening for the "send-location" event from the client
    socket.on("send-location", function(data){
        // Broadcasting the received location data to all connected clients, including the sender
        io.emit("receive-location", { id: socket.id, ...data });
    });
    
    // Listening for the "disconnect" event when a user disconnects
    socket.on("disconnect", function(){
        // Broadcasting to all clients that a user has disconnected, sending the socket ID
        io.emit("user-disconnected", socket.id);
    });
});

// Route handler for the home page
app.get("/", function (req, res) { // Handling GET requests to the root URL
    res.render("index"); // Rendering the "index.ejs" template when the root URL is accessed
});

// Starting the server on port 3000
server.listen(3000, function() {
    console.log("Server is running on port 3000"); // Logging when the server starts
});

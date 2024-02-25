const WebSocket = require("ws");

// Create a WebSocket server instance
const wss = new WebSocket.Server({ port: 8080 });

// Event listener for when a client connects
wss.on("connection", (ws) => {
    console.log("Client connected");

    // Event listener for when a client sends a message
    ws.on("message", (message) => {
        console.log("Received:", message);
        // Echo the received message back to the client
        ws.send(`Echo: ${message}`);
    });

    // Event listener for when a client disconnects
    ws.on("close", () => {
        console.log("Client disconnected");
    });
});

console.log("WebSocket server running on port 8080");
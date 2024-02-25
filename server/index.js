const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8080 });
const clients = {};

wss.on("connection", (ws) => {
    const id = generateId();
    clients[id] = ws;

    ws.send(JSON.stringify({ type: "id", id }));

    ws.on("message", (message) => {
        message = JSON.parse(message);
        let senderId = "";

        if (message["id"]) {
            senderId = message["id"];
        }
        console.log(message)

        sendToOthers(senderId, JSON.stringify({ type: message["type"] }));
    });

    ws.on("close", () => {
        delete clients[id];
    });
});

function generateId() {
    while (true) {
        const id = Math.random().toString(36).substring(7);
        if (!clients[id]) {
            return id;
        }
    }
}

function sendToOthers(senderId, message) {
    for (const id in clients) {
        if (id !== senderId) {
            clients[id].send(message);
        }
    }
}

console.log("WebSocket server running on port 8080");
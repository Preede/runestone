const cv = require('opencv');
const WebSocket = require('ws');
const fps = 10;
const camInterval = 1000 / fps;


const wss = new WebSocket.Server({
    port: 8080,
});

const sendMessage = (client, type, data) => {
    const message = { type, data };
    const jsonMessage = JSON.stringify(message);
    client.send(jsonMessage);
}

const broadcast = (type, data) => {
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            sendMessage(client, type, data);
        }
    });
}

wss.on('connection', function (ws) {
    console.log("connection");

    try {
        var camera = new cv.VideoCapture(0);
        setInterval(() => {
            camera.read((err, data) => {
                if (err) throw err;
                const raw = data.toBuffer().toString("base64")
               
                broadcast('frame', raw);
            })
        }, camInterval);
      } catch (e){
        console.log("Couldn't start camera:", e)
    }

    setTimeout(function() {
        broadcast('robot', {
            dropoffPoint: 4,
            light: 26,
            temperature: 22
        })
    },4000)
})



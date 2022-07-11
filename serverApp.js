const express = require("express");
const WebSocket = require('ws');
const path = require('path');
const mqtt=require('mqtt');

const app = express();

const wss = new WebSocket.Server({ port: 3001 });

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
    });
    ws.send('something');
});

var mqttClient = mqtt.connect("mqtt://mqtt.eclipseprojects.io",{clientId:"mqttjs041"});

mqttClient.on("connect",function(){
    console.log("connected");
});

mqttClient.on("error",function(error){
    console.log("Can't connect" + error);
});

mqttClient.on('message',function(topic, message, packet){ //listener

    console.log("message is " + message);
    console.log("topic is " + topic);

    var messageJSON = JSON.parse(message);
    var temperature = messageJSON.temperature;
    var timestamp = messageJSON.timestamp;
    var sensor = messageJSON.sensor;

    async function pushToClient(){
        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(temperature);
            }
        });
    }
    pushToClient().catch(console.dir);
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});

app.use(
    express.urlencoded({
        extended: true
    })
)

app.use(express.json());

app.get('/dashboard', async (req, res) => {
    res.sendFile(path.join(__dirname + '/index.html'));
})

var topic="trial1/IoTLesson/raspberrypy1/temperature";
console.log("subscribing to topic" + topic);
mqttClient.subscribe(topic); //single topic
#!/usr/bin/env node

var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),

    colors = [
        {ship: "#8833FF", trail: "#77CC33"},
        {ship: "#88FF33", trail: "#CC3377"},
        {ship: "#FF3388", trail: "#33CC77"},
        {ship: "#3388FF", trail: "#CC7733"}
    ],

    clientList = {},
    publicClientList = [],

    initClient = function () {
        var clientId = Date.now(),
            color = colors[publicClientList.length%colors.length],
            newClient = {
                id: clientId,
                x: 0,
                y: 0,
                ship: color.ship,
                trail: color.trail,
                rotation: 0,
                keysPressed: {}
            };

        clientList[clientId] = newClient;
        publicClientList.push(newClient);

        return clientId;
    },

    getClient = function (clientId) {
        return clientList[clientId] || null;
    },

    updateClientKey = function (clientId, key, val) {
        var client = getClient(clientId);
        if (client) {
            client.keysPressed[key] = val;
        }
    };

server.listen(5555);
app.use('/', express.static(__dirname + '/client'));

io.sockets.on('connection', function (socket) {

    socket.on('connect', function () {

    });

    socket.on('disconnect', function (data) {
        socket.get('clientId', function (err, clientId) {
            socket.broadcast.emit('ClientLeft', {
                id: clientId,
            });
        });
    });

    socket.on('Join', function () {
        var clientId = initClient();
        socket.set('clientId', clientId, function () {
            var newClient = getClient(clientId);

            socket.broadcast.emit('ClientJoined', {
                client: newClient
            });
            socket.emit('Connected', {
                client: newClient
            });

        });
    });

    socket.on('KeyDown', function (data) {
        updateClientKey(data.clientId, data.value, true);
    });

    socket.on('KeyUp', function (data) {
        updateClientKey(data.clientId, data.value, false);
    });

    socket.on('Ping', function (data) {
        var client = getClient(data.clientId);

        if (client) {
            client.x = data.x;
            client.y = data.y;
            client.rotation = data.rotation;

            socket.emit('Pong', {
                clientList: publicClientList
            });
        }
    });
});

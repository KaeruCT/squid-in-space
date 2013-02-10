#!/usr/bin/env node

var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),

    colorCount = 0,

    colors = [
        {ship: "#8833FF", trail: "#77CC33"},
        {ship: "#88FF33", trail: "#7733CC"},
        {ship: "#FF3388", trail: "#33CC77"},
        {ship: "#FF8833", trail: "#3377CC"},
        {ship: "#3388FF", trail: "#CC7733"},
        {ship: "#FFFF33", trail: "#CC3377"}
    ],

    clientList = {},

    initClient = function (playerName) {
        var clientId = Date.now(),
            color = colors[(colorCount+=1)%colors.length],
            newClient = {
                id: clientId,
                x: 0,
                y: 0,
                ship: color.ship,
                trail: color.trail,
                name: playerName.substring(0, 16),
                rotation: 0,
                keysPressed: {}
            };

        clientList[clientId] = newClient;

        return clientId;
    },

    removeClient = function (clientId) {
        var i = 0;
        delete clientList[clientId];
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

server.listen(parseInt(process.argv[2], 10) || 80);
app.use('/', express.static(__dirname + '/client'));

io.sockets.on('connection', function (socket) {
    var updateInterval = setInterval(function () {
        socket.volatile.emit('ClientUpdates', {
            clientList: clientList
        }), 100});

    socket.on('disconnect', function (data) {
        socket.get('clientId', function (err, clientId) {
            socket.broadcast.emit('ClientLeft', {
                id: clientId,
            });
            removeClient(clientId);
        });
        clearInterval(updateInterval);
    });

    socket.on('Join', function (data) {
        var clientId = initClient(data.playerName);
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

    socket.on('ClientUpdate', function (data) {
        var client = getClient(data.clientId);

        if (client) {
            client.x = data.x;
            client.y = data.y;
            client.health = data.health;
            client.rotation = data.rotation;

            if (client.health === 0) {
                socket.emit('ClientDied', {
                    id: data.clientId
                });
            }
        }
    });
});

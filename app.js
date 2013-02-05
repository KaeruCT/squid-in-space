#!/usr/bin/env node

var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),

    clientList = {},
    publicClientList = [],

    initClient = function () {
        var clientId = Date.now(),
            newClient = {
                id: clientId,
                x: 0,
                y: 0,
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
                clientId: clientId
            });
        });
    });

    socket.on('Join', function () {
        var clientId = initClient();
        socket.set('clientId', clientId, function () {
            socket.broadcast.emit('ClientJoined', {
                client: getClient(clientId)
            });
            socket.emit('Connected', {
                clientId: clientId
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

            socket.emit('Pong', {
                clientList: publicClientList
            });
        }
    });
});

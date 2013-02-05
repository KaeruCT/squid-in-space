var Net = (function () {
    var
    clientId = null,
    socket = null,
    player = null,
    game = null,

    connected = function (data) {
        clientId = data.clientId;
        game.initPlayer(clientId);

        emit('Ping', {x: 0, y: 0});
    },

    clientJoined = function (data) {
        game.addPlayer(data.client);
    },

    clientLeft = function (data) {
        game.removePlayer(data.clientId);
    },

    ping = function (data) {
        processClientList(data);

        emit('Ping', {
            x: player.x,
            y: player.y
        });
    },

    emit = function (event, data) {
        var d;

        if (typeof data != "object") {
            d = {value: data};
        } else {
            d = data;
        }

        d.clientId = clientId;

        socket.emit(event, d);
    },

    processClientList = function (data) {
        var i,
            cl = data.clientList;

        for (i = 0; i < cl.length; i+= 1) {
            game.updatePlayer(cl[i]);
        }
    }

    return {
        init: function (socketURL, g) {
            player = g.player;
            game = g;
            socket = io.connect(socketURL);
            socket.on('Connected', connected);
            socket.on('ClientJoined', clientJoined);
            socket.on('ClientLeft', clientLeft);
            socket.on('Pong', ping);

            emit('Join');
        },

        send: function (event, data) {
            emit(event, data);
        }
    };
}());

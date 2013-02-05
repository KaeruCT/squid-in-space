var Net = (function () {
    var
    clientId = null,
    socket = null,
    player = null,
    game = null,

    connected = function (data) {
        clientId = data.client.id;
        game.initPlayer(data.client);

        setInterval(function () {
            emit('ClientUpdate', {
                x: player.x,
                y: player.y,
                rotation: player.rotation
            });
        }, 100);
    },

    clientJoined = function (data) {
        game.addPlayer(data.client);
    },

    clientLeft = function (data) {
        game.removePlayer(data.id);
    },

    clientUpdates = function (data) {
        processClientList(data);
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
            socket.on('ClientUpdates', clientUpdates);

            emit('Join');
        },

        send: function (event, data) {
            emit(event, data);
        }
    };
}());

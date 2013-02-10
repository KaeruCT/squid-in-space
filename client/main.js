requirejs.config({
    shim: {
        "crafty": {
            "exports": "Crafty"
        },
        "socket.io": {
            "exports": "socket"
        }
    },

    paths: {
        "crafty": "lib/crafty",
        "socket.io": "/socket.io/socket.io.js"
    }
});

require(["game"], function (Game) {
    var d = function (id) {
        return document.getElementById(id);
    };

    String.prototype.htmlEntities = function() { // hacky for now
        return this.valueOf().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    d('start-game').addEventListener('submit', function (e) {
        e.preventDefault();
        d('player-name').style.display = 'none';
        d('game').style.display = 'block';

        Game.init(d('player-name').value);
    });

    d('player-name').focus();
});

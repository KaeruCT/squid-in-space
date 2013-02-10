define(["crafty", "net", "socket.io",
        "components/player", "components/particle"], function (Crafty, Net, io) {
    var g = {
        player: null,
        playerName: null,
        playerId: 0,
        removedPlayers: [],
        defaultstarlifecycle: 1/25,
        stardecay: 1/25,
        stargrowth: 1/25,
        starcycle: 25,
        stargroupsize: 25,
        stargroupcount: 0,
        maxstargroups: 2,
        curstargroup: 1,
        v: null,
        starsready: false,

        randx: function () {
            return Crafty.math.randomInt(
                g.player.x - g.v.width + g.player._vel.x * g.player._speed,
                g.player.x + g.v.width + g.player._vel.x * g.player._speed
            );
        },
        randy: function () {
            return Crafty.math.randomInt(
                g.player.y - g.v.height + g.player._vel.y * g.player._speed,
                g.player.y + g.v.height + g.player._vel.y * g.player._speed
            );
        },

        generateStars: function () {
            var i = 0,
                randx, randy,
                enterFrame = function () {
                    this.x -= g.player._vel.x * this.speed;
                    this.y += g.player._vel.y * this.speed;
                };

            g.stargroupcount += 1;

            if (g.stargroupcount >= g.maxstargroups) {
                g.starsready = true;
            }

            for (; i < g.stargroupsize; i += 1) {
                Crafty.e('Star, Star'+g.stargroupcount)
                .attr({
                    x: g.randx(),
                    y: g.randy(),
                    decay: g.stardecay,
                    growth: g.stargrowth,
                    group: g.stargroupcount
                }).bind('EnterFrame', enterFrame);
            }
        },

        showStars: function () {
            if (!g.starsready) {
                g.generateStars();
                return;
            }

            Crafty('Star'+g.curstargroup).each(function () {
                this.attr({
                    visible: true,
                    x: g.randx(),
                    y: g.randy(),
                    alpha: 0
                });
            });

            if (g.curstargroup < g.stargroupcount) {
                g.curstargroup += 1;
            } else {
                g.curstargroup = 1;
            }
        },

        checkStarCycle: function (e) {
            var s;

            if (e.frame % g.starcycle === 0) {
                g.showStars();

                if (g.player_speed) {
                    s = g.player._speed;
                    g.stardecay = s;
                    g.stargrowth = s;
                }

                g.starcycle = 1/g.stardecay;
            }
        },

        updatePlayerList: function (data) {
            var i,
                p,
                html = '';

            for(i in data) {
                p = data[i];
                html += '<div class="player">' +
                    '<span class="avatar" style="background: '+p.ship+';"></span>' +
                    '&nbsp;'+p.name.htmlEntities()+'&nbsp;['+p.x.toFixed(0)+' '+p.y.toFixed(0)+']' +
                    '</div>';
            }

            if (!html) {
                html = '<span class="error">Disconnected!</span>';
            }

            document.getElementById('player-list').innerHTML = html;
        },

        displayError: function (data) {
            var html = '<span class="error">Disconnected!</span>';
            document.getElementById('player-list').innerHTML = html;
            console.log(data);
        },

        // inits the current player
        initPlayer: function (clientData) {
            g.player.addComponent('Player'+clientData.id).
            attr({
                trailcolor: clientData.trail,
                name: clientData.name
            }).
            color(clientData.ship);

            g.playerId = clientData.id;
        },

        addPlayer: function (playerData) {
            if (Crafty('Player'+playerData.id).length) {
                return;
            }

            var p = Crafty.e('Player').
            addComponent('Player'+playerData.id).
            color(playerData.ship).
            attr({trailcolor: playerData.trail});

            g._updatePlayer(p, playerData);
        },

        removePlayer: function (id) {
            Crafty('Player'+id).destroy();
            g.removedPlayers.push(id);
        },

        updatePlayer: function (playerData) {
            // exit if player is the same as current client
            // or if the player was already removed
            if (playerData.id === g.playerId ||
                g.removedPlayers.indexOf(playerData.id) > -1) {
                return;
            }

            var p = Crafty('Player'+playerData.id);

            if (!p.length) {
                g.addPlayer(playerData);
            } else {
                g._updatePlayer(p, playerData);
            }
        },

        _updatePlayer: function (p, playerData) {
            // shit interpolation for now
            var r = p.rotation + (playerData.rotation - p.rotation)/2,
                p.x + (playerData.x - p.x)/2,
                p.y + (playerData.y - p.y)/2;

            p.attr({
                x: x,
                y: y,
                rotation: r,
                name: playerData.name,
                keysPressed: playerData.keysPressed
            });
        }
    };

    return {
        init: function (playerName) {
            Crafty.init();
            Crafty.viewport.init(640, 480);
            Crafty.viewport.clampToEntities = false;

            Crafty.background('#000000');

            g.v = Crafty.viewport;

            g.playerName = playerName;

            g.player = Crafty.e('ControllablePlayer').
            attr({
                x: 0,
                y: 0
            });

            g.player.bind('KeyDown', function (e) {
                Net.send('KeyDown', e.key);
            });

            g.player.bind('KeyUp', function (e) {
                Net.send('KeyUp', e.key);
            });

            g.generateStars();

            Crafty.viewport.follow(g.player);

            Crafty.bind('EnterFrame', g.checkStarCycle);

            Net.init('', g, g.playerName);
        }
    };
});

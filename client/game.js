var Game = (function (Crafty, Net) {
    var g = {
        player: null,
        playerId: 0,
        defaultstarlifecycle: 1/25,
        stardecay: 1/25,
        stargrowth: 1/25,
        starcycle: 25,
        stargroupsize: 70,
        stargroupcount: 0,
        maxstargroups: 2,
        curstargroup: 1,
        v: Crafty.viewport,
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

        initPlayer: function (id) {
            Crafty('Player').addComponent('Player'+id);
            g.playerId = id;
        },

        addPlayer: function (playerData) {
            var existing = Crafty('Player'+playerData.id).length;

            if (existing) {
                return;
            }

            Crafty.e('Player').
            addComponent('Player'+playerData.id).
            attr({
                x: playerData.x,
                y: playerData.y,
                keysPressed: playerData.keysPressed
            });
        },

        removePlayer: function (id) {
            Crafty('Player'+id).destroy();
        },

        updatePlayer: function (playerData) {
            if (playerData.id === g.playerId) {
                return;
            }

            var p = Crafty('Player'+playerData.id);

            if (!p.length) {
                p = Crafty.e('Player').
                addComponent('Player'+playerData.id);
            }

            p.attr({
                x: playerData.x,
                y: playerData.y,
                keysPressed: playerData.keysPressed
            });
        }
    };

    return {
        init: function () {
            Crafty.init();
            Crafty.viewport.init(600, 400);
            Crafty.viewport.clampToEntities = false;

            Crafty.background('#000000');

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

            Net.init('', g);
        }
    };
}(Crafty, Net));

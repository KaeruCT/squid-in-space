var Game = (function (Crafty) {
    var g = {
        player: null,
        defaultstarlifecycle: 1/25,
        stardecay: 1/25,
        stargrowth: 1/25,
        starcycle: 25,
        stargroupsize: 150,
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
        }
    };

    return {
        init: function () {
            Crafty.init();
            Crafty.viewport.init(600, 400);
            Crafty.viewport.clampToEntities = false;

            Crafty.background('#000000');

            g.player = Crafty.e('Player').
            attr({
                x: 0,
                y: 0
            });

            g.generateStars();
            g.generateStars();

            Crafty.viewport.follow(g.player);

            Crafty.bind('EnterFrame', function (e) {
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
            });
        }
    };
}(Crafty));

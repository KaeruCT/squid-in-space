define(["crafty"], function (Crafty) {
    Crafty.c('MovingParticle', {
        init: function () {
            var self = this;

            self.addComponent('2D, Canvas, Color');
            self.attr({
                vel: null,
                w: 2,
                h: 2,
                x: 0,
                y: 0,
                alpha: 1,
                speed: 0,
                lifetime: 100,
            });

            self.bind('EnterFrame', function () {
                this.x += this.speed * this.vel.x;
                this.y -= this.speed * this.vel.y;

                if (this.lifetime === 0) {
                    this.alpha -= 0.1;
                    if (this.alpha <= 0) {
                        this.destroy();
                    }
                } else {
                    this.lifetime -= 1;
                }
            });
        }
    });

    Crafty.c('Trail', {
        init: function () {
            var self = this;

            self.addComponent('MovingParticle');
            self.origin('middle center');

            self.attr({
                lifetime: 20,
                speed: 0.5
            });
        }
    });

    Crafty.c('Bullet', {
        init: function () {
            var self = this;

            self.addComponent('MovingParticle, Collision');

            self.onHit('Player', function(ent) {
                var target = ent[0].obj;

                if (target !== self.player) {
                    target.damage(1);
                    self.destroy();
                }
            });

            self.attr({
                player: null,
                alpha: 0.8,
                speed: 10,
                lifetime: 40,
            });
        }
    });

    Crafty.c('Star', {
        init: function () {
            var self = this,
                c = Crafty.math.randomInt(120, 225),
                s = Crafty.math.randomInt(2, 3);

            self.addComponent('2D, Canvas, Color, Circle');
            self.color('rgb('+c+', '+c+', '+c+')');
            self.attr({
                w: s,
                h: s,
                x: 0,
                y: 0,
                growth: 0,
                decay: 0,
                alpha: 0,
                group: 0,
                speed: (Crafty.math.randomInt(1, 3)/10)
            });

            self._lit = false;

            self.bind('EnterFrame', function (e) {
                if (!this.visible) {
                    return;
                }

                if (!this._lit && this.alpha < 1) {
                    this.alpha += this.growth;
                } else {
                    this._lit = true;

                    this.alpha -= this.decay;

                    if (this.alpha <= 0) {
                        this._lit = false;
                        this.visible = false;
                    }
                }
            });
        }
    });
});

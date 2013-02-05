(function (Crafty) {
    Crafty.c('ControllablePlayer', {
        init: function () {
            var self = this;

            self.addComponent('Player');

            self.bind('KeyDown', function (e) {
                // set key as pressed
                self.keysPressed[e.key] = true;
            });

            self.bind('KeyUp', function (e) {
                // set key as unpressed
                self.keysPressed[e.key] = false;
            });
        }
    });

    Crafty.c('Player', {
        init: function () {
            var self = this;
            self.addComponent('2D, Canvas, Color, KeyBoard');

            self._vel = new Crafty.math.Vector2D(0, 0);
            self._maxspeed = 4;
            self._speed = 0;
            self._cos = 0;
            self._sin = 1;
            self._trailcolor = "#CC7733";
            self.attr({
                w: 16,
                h: 8,
                rotation: -90,
                keysPressed: {}
            });

            self.isKeyPressed = function (keyCode) {
                return self.keysPressed[keyCode] || false;
            };
            self.accelerate = function (val, rad) {
                var velDelta;

                if (self._speed + val > self._maxspeed) {
                    self._vel.add(new Crafty.math.Vector2D(
                        -self._vel.x*0.01,
                        -self._vel.y*0.01
                    ));
                    return;
                }

                if (val < 0) {
                    self._vel.add(new Crafty.math.Vector2D(
                        -self._vel.x*0.05,
                        -self._vel.y*0.05
                    ));
                } else {
                    self._vel.add(new Crafty.math.Vector2D(
                        Math.cos(rad)*0.1,
                        Math.sin(rad)*0.1
                    ));
                }
            };
            self.shoot = function () {
                var rad = Crafty.math.degToRad(self.rotation);
                Crafty.e('Bullet').attr({
                    x: Math.ceil(self.x + self.w/2)-1,
                    y: Math.ceil(self.y + self.h/2)-1,
                    w: 2,
                    h: 2,
                    vel: new Crafty.math.Vector2D(
                        Math.cos(rad),
                        Math.sin(-rad)
                    )
                }).
                color(self.color());
            };
            self.trail = function (rad) {
                Crafty.e('Trail').attr({
                    x: Math.ceil(self.x + self.w/2)-2,
                    y: Math.ceil(self.y + self.h/2)-2,
                    w: 4,
                    h: 4,
                    alpha: 0.5,
                    vel: new Crafty.math.Vector2D(
                        Math.cos(-rad),
                        Math.sin(rad)
                    ),
                    rotation: self.rotation
                }).
                color(self._trailcolor);
            };

            self.origin('middle center');
            self.color('#3388FF');

            self.bind('EnterFrame', function (e) {
                var k = Crafty.keys,
                    rad;

                self.x += self._vel.x;
                self.y -= self._vel.y;

                self._speed = ((Math.abs(self._vel.x) + Math.abs(self._vel.y)) / 2);

                if (self.isKeyPressed(k.LEFT_ARROW) || self.isKeyPressed(k.A)) {
                    self.rotation -= 7;
                }

                if (self.isKeyPressed(k.RIGHT_ARROW)  || self.isKeyPressed(k.D)) {
                    self.rotation += 7;
                }

                if (self.isKeyPressed(k.UP_ARROW)  || self.isKeyPressed(k.W)) {
                    rad = Crafty.math.degToRad(-self.rotation);
                    self.accelerate(0.01, rad);

                    self.trail(rad);
                }

                if (self.isKeyPressed(k.Q)) {
                    rad = Crafty.math.degToRad(self.rotation + 90);
                    self.accelerate(0.01, rad);
                    self.trail(rad);
                }

                if (self.isKeyPressed(k.E)) {
                    rad = Crafty.math.degToRad(self.rotation - 90);
                    self.accelerate(0.01, rad);
                    self.trail(rad);
                }

                if (self.isKeyPressed(k.DOWN_ARROW)  || self.isKeyPressed(k.S)) {
                    rad = Crafty.math.degToRad(self.rotation);
                    self.accelerate(-0.01, rad);
                }

                if (self.isKeyPressed(k.SPACE)) {
                    self.shoot();
                }
            });
        }
    });

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

            self.addComponent('MovingParticle');

            self.attr({
                alpha: 0.8,
                speed: 10,
                lifetime: 50,
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
}(Crafty));

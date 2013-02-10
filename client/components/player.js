define(["crafty"], function (Crafty) {
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
            self.addComponent('2D, Canvas, Color, KeyBoard, Damageable, Collision');

            self._maxspeed = 2;
            self._speed = 0;
            self._cos = 0;
            self._sin = 1;
            self.attr({
                x: 0,
                y: 0,
                w: 16,
                h: 8,
                z: 9999,
                keysPressed: {},
                name: '',
                _vel: new Crafty.math.Vector2D(0, 0)
            });

            self.origin('middle center');
            self.color('#FFFFFF');

            self.collision();
            self.rotation = -90;

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
                    player: self,
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
                color(self.trailcolor);
            };

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

                    if (e.frame % 5 === 0) {
                        self.trail(rad);
                    }
                }

                if (self.isKeyPressed(k.E)) {
                    rad = Crafty.math.degToRad(self.rotation + 90);
                    self.accelerate(0.01, rad);
                    if (e.frame % 5 === 0) {
                        self.trail(rad);
                    }
                }

                if (self.isKeyPressed(k.Q)) {
                    rad = Crafty.math.degToRad(self.rotation - 90);
                    self.accelerate(0.01, rad);
                    if (e.frame % 5 === 0) {
                        self.trail(rad);
                    }
                }

                if (self.isKeyPressed(k.DOWN_ARROW)  || self.isKeyPressed(k.S)) {
                    rad = Crafty.math.degToRad(self.rotation);
                    self.accelerate(-0.01, rad);
                }

                if (self.isKeyPressed(k.SPACE) && e.frame % 5 === 0) {
                    self.shoot();
                }
            });
        }
    });

    Crafty.c('Damageable', {
        init: function () {
            var self = this;

            self.attr({
                health: 10,
                maxhealth: 10
            });

            self.heal = function (val) {
                if (!val) {
                    self.health = self.maxhealth;
                    return;
                }

                val = Math.abs(val);
                if (self.health + val <= maxhealth) {
                    self.health -= val;
                } else {
                    self.health = self.maxhealth;
                }
            };

            self.damage = function (val) {
                val = Math.abs(val);
                if (self.health - val >= 0) {
                    self.health -= val;
                } else {
                    self.health = 0;
                }
            };

            self.isDead = function () {
                return health === 0;
            };
        }
    });
});

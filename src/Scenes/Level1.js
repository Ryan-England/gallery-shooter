class Level1 extends Phaser.Scene {
    constructor() {
        super("Level1");
        this.my = {sprite:{}};

        this.random = Phaser.Math.RND;

        this.movementSpeed = 3;
        this.friendBulletSpeed = 6;

        this.enemyShiftSpeed = 70;
        this.enemyShiftDistance = -30;
        this.enemyShiftCounter = this.enemyShiftSpeed;

        this.enemyAttack = 40;
        this.enemyAttackCounter = this.enemyAttack;
        this.enemyBulletSpeed = 4;

        this.playerAxis = 60;
        this.playerDead = false;
        this.gameWon = false;

        this.shootCooldown = 40;
        this.shootCooldownCounter = 0;

        this.playerHitError = 4;
        this.enemyHitError = -2;

        this.enemyPositions = [
            200, 330,
            400, 330,
            600, 330,
            800, 330,
            700, 220,
            510, 220,
            300, 220,
            400, 90,
            600, 90
        ]

        // this.rightPath = [
        //     170, 8,
        //     170, 280,
        //     490, 485,
        //     810, 410,
        //     675, 275,
        //     585, 410,
        //     930, 500,
        //     1500, 0,
        //     500, -60
        // ]

        // this.leftPath = [
        //     878, 30,
        //     850, 215,
        //     730, 460,
        //     220, 450,
        //     130, 330,
        //     300, 260,
        //     400, 350,
        //     180, 515,
        //     30, 425,
        //     -1500, 0,
        //     500, -60
        //     ]

        //     this.bPath = true;
    }

    preload() {
        this.load.setPath("./assets/");
        this.load.image("underground", "tilemap_packed.png"); // tile sheet
        this.load.tilemapTiledJSON("maze", "Maze.json"); // tilemap JSON
        this.load.image("pizza", "tile_0106.png");
        this.load.image("bullet", "tile_0105.png");

        this.load.image("redTile", "metalPanel_red.png");
        this.load.image("yellowTile", "metalPanel_yellow.png");
        this.load.image("greenTile", "metalPanel_green.png");

        this.load.image("redEnemBullet", "emote_anger.png");
        this.load.image("yellowEnemBullet", "emote_bars.png");
        this.load.image("greenEnemBullet", "emote_swirl.png");
        this.load.image("congrats", "congratulations.png");
        this.load.image("ded", "You_DIED.png");
    }

    create() {
        let my = this.my;

        this.map = this.add.tilemap("maze", 16, 16, 10, 10);
        this.tileset = this.map.addTilesetImage("tiny-dungeon-packed", "underground");

        this.groundLayer = this.map.createLayer("Ground-n-tunnel", this.tileset, 0 ,0);
        this.groundLayer.setScale(5.0);

        this.left = this.input.keyboard.addKey("A");
        this.right = this.input.keyboard.addKey("D");
        this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        my.sprite.player = new Player(this, game.config.width/2, game.config.height - this.playerAxis, "pizza", null, this.left, this.right, this.movementSpeed);
        my.sprite.player.setScale(5.0);

        my.sprite.endScreen = this.add.sprite(500, -400, "congrats");
        my.sprite.deathScreen = this.add.sprite(500, -100, "ded");
        my.sprite.deathScreen.setScale(2.0)

        my.sprite.bullets = this.add.group({
            active: true,
            defaultKey: "bullet",
            maxSize: 6,
            runChildUpdate: true
        })

        my.sprite.bullets.createMultiple({
            classType: Bullet,
            active: false,
            key: my.sprite.bullets.defaultKey,
            repeat: my.sprite.bullets.maxSize - 1
        });
        my.sprite.bullets.propertyValueSet("speed", this.friendBulletSpeed);
        my.sprite.bullets.scaleXY(1.5, 1.5);

        my.sprite.enemies = this.add.group({
            active: true,
            defaultKey: "redTile",
            maxSize: 9,
        })

        my.sprite.enemies.createMultiple({
            //classType: Phaser.GameObjects.PathFollower,
            key: "redTile",
            // path: this.leftFirst,
            x: game.config.width / 2,
            repeat: 3
        });

        my.sprite.enemies.createMultiple({
            //classType: Phaser.GameObjects.PathFollower,
            key: "yellowTile",
            repeat: 2
        })

        my.sprite.enemies.createMultiple({
            //classType: Phaser.GameObjects.PathFollower,
            key: "greenTile",
            repeat: 1
        })

        let i = 0;
        for (let enemy of my.sprite.enemies.getChildren()) {
            enemy.x = game.config.width / 2;
            enemy.y = -60;
            enemy.shooting = false;
            if (i < 4) {
                enemy.health = 1;
            } else if (i < 7) {
                enemy.health = 2;
            } else {
                enemy.health = 3;
            }
            i++;
        }

        my.sprite.enemyBullets = this.add.group({
            active: false,
            defaultKey: "redEnemBullet",
            maxSize: 5
        })

        my.sprite.enemyBullets.createMultiple({
            key: my.sprite.enemyBullets.defaultKey,
            repeat: my.sprite.enemyBullets.maxSize - 1
        });
        my.sprite.enemyBullets.setXY(500, 50);
        my.sprite.enemyBullets.scaleXY(2.0, 2.0);

        for (let bullet of my.sprite.enemyBullets.getChildren()) {
            bullet.active = false;
            bullet.visible = false;
        }

        // this.leftFirst = new Phaser.Curves.Spline(this.leftPath);
        // this.leftSecond = new Phaser.Curves.Spline(this.leftPath);
        // this.leftThird = new Phaser.Curves.Spline(this.leftPath);

        // this.rightFirst = new Phaser.Curves.Spline(this.rightPath);
        // this.rightSecond = new Phaser.Curves.Spline(this.rightPath);
        // this.rightThird = new Phaser.Curves.Spline(this.rightPath);
    }

    update() {
        let my = this.my;
        this.shootCooldownCounter--;
        this.enemyShiftCounter--;
        this.enemyAttackCounter--;

        my.sprite.player.update();

        if (this.enemyShiftCounter < 0) {
            this.enemyShiftCounter = this.enemyShiftSpeed;
            this.enemyShiftDistance = -this.enemyShiftDistance;
        }

        if (this.enemyAttackCounter < 0) {
            // console.log("trying to shoot");
            this.enemyAttackCounter = this.enemyAttack;
            let nth = this.random.integerInRange(0, 9);
            // console.log(nth);
            let enemy = my.sprite.enemies.getFirstNth(nth, true);
            let bullet = my.sprite.enemyBullets.getFirstDead();
            if (bullet != null && enemy != null) {
                // console.log("shooting bullet");
                bullet.x = enemy.x;
                bullet.y = enemy.y + 40;
                // console.log("bullet.x", bullet.x);
                // console.log("bullet.y", bullet.y);
                bullet.visible = true;
                bullet.active = true;
                // if (enemy.health == 3) {
                //     bullet.setTexture("greenEnimBullet");
                // } else if (enemy.health == 2) {
                //     bullet.setTexture("yellowEnimBullet");
                // } else {
                //     bullet.setTexture("redEnimBullet");
                // }
            }

            // let i = 1;
            // for (let enemy of my.sprite.enemies.getChildren()) {
                // if (!enemy.shooting) {
                //     enemy.shooting = false;
                //     enemy.stopFollow();
                // } else {
                //     enemy.shooting = true;
                //     if (bPath && i == 1) {
                //         this.leftFirst.points[0].x = enemy.x;
                //         this.leftFirst.points[0].y = enemy.y;
                //         i++;
                //     } else if (bPath && i == 2) {
                //         this.leftSecond.points[0].x = enemy.x;
                //         this.leftSecond.points[0].y = enemy.y;
                //         i++;
                //     } else if (bPath && i == 3) {
                //         this.leftThird.points[0].x = enemy.x;
                //         this.leftThird.points[0].y = enemy.y;
                //         i++;
                //     } else if (!bPath && i == 1) {
                //         this.rightFirst.points[0].x = enemy.x;
                //         this.rightFirst.points[0].y = enemy.y;
                //         i++;
                //     } else if (!bPath && i == 2) {
                //         this.rightSecond.points[0].x = enemy.x;
                //         this.rightSecond.points[0].y = enemy.y;
                //         i++;
                //     } else if (!bPath && i == 3) {
                //         this.rightThird.points[0].x = enemy.x;
                //         this.rightThird.points[0].y = enemy.y;
                //         i++;
                //     }
                //     if (i <= 3) {
                //         enemy.startFollow({
                //             from: 0,
                //             to: 1,
                //             delay: 0,
                //             duration: 600 * this.curve.points.length,
                //             ease: 'Sine.easeInOut',
                //             repeat: 0,
                //              yoyo: false,
                //             rotateToPath: true,
                //             rotationOffset: -90
                //         });
                //     }
                // }
            // }
        }

        for (let bullet of my.sprite.enemyBullets.getChildren()) {
            if (bullet.active == true) {
                bullet.y += this.enemyBulletSpeed;
                if (bullet.y >= game.config.height) {
                    bullet.active = false;
                    bullet.visible = false;
                    //console.log("Bullet offscreen");
                }
            }
        }

        if (this.space.isDown && this.shootCooldownCounter < 0) {
            let bullet = my.sprite.bullets.getFirstDead();
            if (bullet != null && !this.playerDead) {
                this.shootCooldownCounter = this.shootCooldown;
                bullet.makeActive();
                bullet.x = my.sprite.player.x;
                bullet.y = my.sprite.player.y - 40;
            }
            if (this.playerDead || this.gameWon) {
                this.reset();
            }
        }

        let i = 0;
        for (let enemy of my.sprite.enemies.getChildren()) {
            if (enemy.active && !enemy.shooting) {
                if (enemy.x < this.enemyPositions[i] + this.enemyShiftDistance) {
                    enemy.x++;
                } else if (enemy.x > this.enemyPositions[i] + this.enemyShiftDistance) {
                    enemy.x--;
                }
                if (enemy.y < this.enemyPositions[i+1]) {
                    enemy.y += 3;
                } else if (enemy.y > this.enemyPositions[i+1]) {
                    enemy.y -= 2;
                }
            }
            i += 2;
        }

        for (let bullet of my.sprite.bullets.getChildren()) {
            for (let enemy of my.sprite.enemies.getChildren()) {
                if (bullet.active && enemy.active) {
                    if (Phaser.Math.Distance.Between(bullet.x, bullet.y, enemy.x, enemy.y) < (enemy.width + bullet.width) / 2) {
                        bullet.makeInactive();
                        if (enemy.health == 3) {
                            enemy.setTexture("yellowTile");// = "yellowTile";
                            // console.log("Hit Green Enemy");
                            enemy.health--;
                        } else if (enemy.health == 2) {
                            enemy.setTexture("redTile");
                            // console.log("Hit Yellow Enemey");
                            enemy.health--;
                        } else if (enemy.health <= 1) {
                            enemy.active = false;
                            enemy.visible = false;
                            // console.log("Hit Red Enemy");
                        }
                    }
                }
            }
        }
        for (let bullet of my.sprite.enemyBullets.getChildren()) {
            if (bullet.active && !this.playerDead) {
                if (Phaser.Math.Distance.Between(bullet.x, bullet.y, my.sprite.player.x, my.sprite.player.y) < (my.sprite.player.width + bullet.width) / 2) {
                    this.playerDead = true;
                    my.sprite.player.visible = false;
                }
            }
        }

        if (my.sprite.enemies.countActive() == 0 && my.sprite.endScreen.y < 400) {
            my.sprite.endScreen.y += 3;
            this.gameWon = true;
        } else if (my.sprite.endScreen > -400) {
            my.sprite.endScreen.y -= 7;
            console.log("Scroll up endscreen");
        }

        if (this.playerDead && my.sprite.deathScreen.y < 500) {
            my.sprite.deathScreen.y += 3;
        } else if (my.sprite.deathScreen > -100) {
            my.sprite.deathScreen.y -= 7;
            console.log("Scroll up deathscreen");
        }
    }

    reset() {
        let my = this.my;

        my.sprite.player.x = game.config.width/2;
        my.sprite.player.visible = true;
        this.playerDead = false;
        this.gameWon = false;
        this.shootCooldownCounter = this.shootCooldown;
        this.enemyAttackCounter = this.enemyAttack;
        for (let bullet of my.sprite.bullets.getChildren()) {
            bullet.makeInactive();
        }
        let i = 0;
        for (let enemy of my.sprite.enemies.getChildren()) {
            enemy.visible = true;
            enemy.active = true;
            enemy.x = 500;
            enemy.y = -200;
            if (i < 4) {
                enemy.health = 1;
                enemy.setTexture("redTile");
            } else if (i < 7) {
                enemy.health = 2;
                enemy.setTexture("yellowTile");
            } else {
                enemy.health = 3;
                enemy.setTexture("greenTile");
            }
            i++;
        }
        for (let bullet of my.sprite.enemyBullets.getChildren()) {
            bullet.active = false;
            bullet.visible = false;
        }
        my.sprite.deathScreen.y = -100;
        my.sprite.endScreen.y = -400;
    }
}
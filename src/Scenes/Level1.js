class Level1 extends Phaser.Scene {
    constructor() {
        super("Level1");
        this.my = {sprite:{}};
        

        this.movementSpeed = 3;
        this.friendBulletSpeed = 6;

        this.enemyShiftSpeed = 40;
        this.enemyShiftDistance = -30;
        this.enemyShiftCounter = this.enemyShiftSpeed;

        this.enemyAttack = 160
        this.enemyAttackCounter = this.enemyAttack;

        this.playerAxis = 60;

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

        this.rightPath = [
            170, 8,
            170, 280,
            490, 485,
            810, 410,
            675, 275,
            585, 410,
            930, 500,
            1500, 0,
            500, -60
        ]
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
            key: "redTile",
            repeat: 3
        });

        my.sprite.enemies.createMultiple({
            key: "yellowTile",
            repeat: 2
        })

        my.sprite.enemies.createMultiple({
            key: "greenTile",
            repeat: 1
        })

        let i = 0;
        for (let enemy of my.sprite.enemies.getChildren()) {
            enemy.x = game.config.width / 2;
            enemy.y = -60;
            if (i < 4) {
                enemy.health = 1;
            } else if (i < 7) {
                enemy.health = 2;
            } else {
                enemy.health = 3;
            }
            i++;
        }
    }

    update() {
        let my = this.my;
        this.shootCooldownCounter--;
        this.enemyShiftCounter--;
        this.enemyAttackCounter--;

        if (this.enemyShiftCounter < 0) {
            this.enemyShiftCounter = this.enemyShiftSpeed;
            this.enemyShiftDistance = -this.enemyShiftDistance;
        }

        // if (this.enemyAttackCounter < 0) {
        //     waveFirst = my.sprite.enemies.getFirstNth(0, true);
        //     waveSecond = my.sprite.enemies.getFirstNth(1, true);
        //     waveThird = my.sprite.enemies.getFirstNth(2, true);
        // }

        if (this.space.isDown && this.shootCooldownCounter < 0) {
            let bullet = my.sprite.bullets.getFirstDead();
            if (bullet != null) {
                this.shootCooldownCounter = this.shootCooldown;
                bullet.makeActive();
                bullet.x = my.sprite.player.x;
                bullet.y = my.sprite.player.y - 40;
            }
        }

        let i = 0;
        for (let enemy of my.sprite.enemies.getChildren()) {
            if (enemy.active) {
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

        my.sprite.player.update();

    }
}
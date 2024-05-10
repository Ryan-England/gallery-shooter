class Level1 extends Phaser.Scene {
    constructor() {
        super("Level1");
        this.my = {sprite:{}};
        

        this.movementSpeed = 8;
        this.friendBulletSpeed = 10;

        this.playerAxis = 60;

        this.shootCooldown = 2;
        this.shootCooldownCounter = 0;
    }

    preload() {
        this.load.setPath("./assets/");
        this.load.image("underground", "tilemap_packed.png"); // tile sheet
        this.load.tilemapTiledJSON("maze", "Maze.json"); // tilemap JSON
        this.load.image("cursor", "pointer_a.png");
        this.load.image("bullet", "navigation_n.png");
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

        my.sprite.player = new Player(this, game.config.width/2, game.config.height - this.playerAxis, "cursor", null, this.left, this.right, this.movementSpeed);
        my.sprite.player.setScale(3.0);

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
    }

    update() {
        let my = this.my;
        this.shootCooldownCounter--;

        if (this.space.isDown && this.shootCooldownCounter < 0) {
            let bullet = my.sprite.bullets.getFirstDead();
            if (bullet != null) {
                this.shootCooldownCounter = this.shootCooldown;
                bullet.makeActive();
                bullet.x = my.sprite.player.x;
                bullet.y = my.sprite.player.y - 30;
            }
        }

        my.sprite.player.update();

    }
}
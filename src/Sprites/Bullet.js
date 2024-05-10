class Bullet extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame, shootSpeed) {        
        super(scene, x, y, texture, frame);
        this.visible = false;
        this.active = false;
        this.speed = shootSpeed;
        return this;
    }

    update() {
        if (this.active) {
            this.y -= this.speed;
            if (this.y < -(this.displayHeight/2)) {
                this.makeInactive();
            }
        }
    }

    makeActive() {
        this.visible = true;
        this.active = true;
    }

    makeInactive() {
        this.visible = false;
        this.active = false;
    }

}
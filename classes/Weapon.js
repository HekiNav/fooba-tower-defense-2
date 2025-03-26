import Sprite from "./Sprite.js";

export default class Weapon extends Sprite {
    constructor(x, y, source, tileSize) {
        super(tileSize * 0.5, tileSize * 0.5, tileSize, tileSize, source.weapon.img)
        this.xx = x
        this.yy = y
        this.angle = 0
        this.size = tileSize
        console.log(x, y)
    }
    update(c) {
        this.draw(c)
        this.angle++
    }
    draw(c) {
        c.translate(this.xx + -this.size * 0.5, this.yy + -this.size * 0.5)
        c.rotate(this.angle * Math.PI / 180)
        super.draw(c)
        c.rotate(-this.angle * Math.PI / 180)
        c.translate(-this.xx + this.size * 0.5, -this.yy + this.size * 0.5)
    }
}
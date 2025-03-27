import Sprite from "./Sprite.js";

export default class Weapon extends Sprite {
    constructor(x, y, source, tileSize) {
        super(0, 0, source.weapon.img.source.width / 64 * tileSize, source.weapon.img.source.width / 64 * tileSize, source.weapon.img)
        this.source = source
        this.xOffset = x
        console.log(y, source.weapon.offset, tileSize)
        this.yOffset = y + source.weapon.offset / 64 * tileSize
        this.angle = 0
        this.size = source.weapon.img.source.width / 64 * tileSize
        this.tileSize = tileSize
        this.turning = source.weapon.turning
        this.projectiles = []
        this.target = null
    }
    update(c) {
        if (this.turning) this.angle = this.#getAngle()
        this.draw(c)
    }
    #getAngle() {
        return this.angle + 1 % 360
    }
    updateSize(x, y, tileSize) {
        console.log(this.yOffset, y, this.source.weapon.offset, tileSize)
        this.xOffset = x
        this.yOffset = y - (this.source.img.source.height / 64 * tileSize - tileSize) + this.source.weapon.offset / 64 * tileSize
        this.size = this.source.weapon.img.source.width / 64 * tileSize
        this.tileSize = tileSize
        super.updateSize(0, 0, this.size, this.size)
    }
    draw(c) {
        c.translate(this.xOffset + this.tileSize * 0.5, this.yOffset + this.tileSize * 0.5)
        c.rotate(this.angle * Math.PI / 180)
        c.translate(-this.size * 0.5, -this.size * 0.5)
        super.draw(c)
        c.translate(this.size * 0.5, this.size * 0.5)
        c.rotate(-this.angle * Math.PI / 180)
        c.translate(-this.xOffset - this.tileSize * 0.5, -this.yOffset - this.tileSize * 0.5)
    }
}
import Sprite from "./Sprite.js"

export default class Projectile extends Sprite {
    constructor(x, y, tileSize, source, fps, target, remove) {
        super(0, 0, source.projectile.img.source.width / 64 * tileSize, source.projectile.img.source.height / 64 * tileSize, source.projectile.img, fps)
        this.xOffset = x
        this.yOffset = y
        this.angle = 0
        this.turning = source.projectile.turning
        this.tileSize = tileSize
        this.source = source
        this.fps = fps
        this.width = source.projectile.img.source.width / 64 * tileSize
        this.height = source.projectile.img.source.height / 64 * tileSize
        this.xSpeed = 0
        this.ySpeed = 0
        this.target = target
        this.remove = remove
        this.untilRemoval = null
        super.updateSize(this.x, this.y, this.width, this.height)
        this.#updateSpeed()
    }
    #updateSpeed() {
        if (this.target == null) {
            this.remove(this)
            return
        }
        const xDiff = this.xOffset - this.target.xPos
        const yDiff = this.yOffset - this.target.yPos
        const ratio = Math.abs(xDiff) + Math.abs(yDiff)

        this.xSpeed = xDiff / ratio * this.source.projectile.speed * this.tileSize / -64
        this.ySpeed = yDiff / ratio * this.source.projectile.speed * this.tileSize / -64
        this.angle = Math.atan2(yDiff, xDiff) - Math.PI * 0.5

        if (ratio < this.tileSize * 0.2 && this.untilRemoval == null) {
            this.untilRemoval = this.fps * this.source.impact.img.duration / 1000
            this.target.hit(this.source.damage, this.source.armorPiercing, this.source.shieldPiercing)
            super.changeImage(this.source.impact.img)
        }
    }
    updateFps(fps) {
        this.fps = fps
        this.#updateSpeed()
    }
    updateDimensions(tileSize) {
        this.xOffset = this.xOffset / this.tileSize * tileSize
        this.yOffset = this.yOffset / this.tileSize * tileSize
        this.width = source.projectile.img.source.width / 64 * tileSize
        this.height = source.projectile.img.source.height / 64 * tileSize
        this.tileSize = tileSize

    }
    update(c) {
        if (this.ticks % Math.round(this.fps * 0.25)) this.#updateSpeed()
        c.translate(this.xOffset + this.tileSize * 0.5, this.yOffset + this.tileSize * 0.5)
        if (this.turning) c.rotate(this.angle)
        c.translate(-this.size * 0.5, -this.size * 0.5)
        super.draw(c)
        c.translate(this.size * 0.5, this.size * 0.5)
        if (this.turning) c.rotate(-this.angle)
        c.translate(-this.xOffset - this.tileSize * 0.5, -this.yOffset - this.tileSize * 0.5)

        if (this.untilRemoval > 0 && this.untilRemoval != null) {
            this.untilRemoval--
        } else if (this.untilRemoval <= 0 && this.untilRemoval != null) {
            this.remove(this)
        } else {
            this.xOffset += this.xSpeed
            this.yOffset += this.ySpeed
        }
    }
}
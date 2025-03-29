import Projectile from "./Projectile.js";
import Sprite from "./Sprite.js";

export default class Weapon extends Sprite {
    constructor(x, y, source, tileSize, fps) {
        super(0, 0, source.weapon.img.source.width / 64 * tileSize, source.weapon.img.source.width / 64 * tileSize, source.weapon.img)
        this.fps = fps
        this.source = source
        this.xOffset = x
        this.yOffset = y + source.weapon.offset / 64 * tileSize
        this.angle = 0
        this.size = source.weapon.img.source.width / 64 * tileSize
        this.tileSize = tileSize
        this.turning = source.weapon.turning
        this.projectiles = []
        this.target = null
        this.shootSprite = new Sprite(0, 0, this.size, this.size, source.weapon.shoot.img, fps)
        this.shooting = 0
        this.cooldown = 0
        this.firedThisAnimation = false
    }
    update(c, enemies) {
        if (enemies) {
            const filtered = enemies.filter((e) => distance(e, { x: this.xOffset, y: this.yOffset }) < this.source.range * this.tileSize)
            if (filtered.length) this.target = filtered.reduce((a, b) => a.ticks > b.ticks ? a : b)
            else this.target = null
            if (this.target) this.angle = this.#getAngle()
        }
        if (this.cooldown > 0 && this.shooting <= 0) this.cooldown--

        if (this.target && this.cooldown <= 0 && this.shooting <= 0) {
            this.shooting = this.shootSprite.frames.length * this.shootSprite.frameTicks
            this.shootSprite.ticks = 0
            this.cooldown = this.source.reload / 1000 * this.fps
            this.firedThisAnimation = false
        }
        if (this.shootSprite.frame >= this.source.weapon.shoot.shootFrame && !this.firedThisAnimation) {
            this.firedThisAnimation = true
            this.shoot(this.target)
        }
        this.draw(c)

        this.projectiles.forEach(p => p.update(c, enemies))
    }
    shoot(target) {
        this.projectiles.push(
            new Projectile(this.xOffset, this.yOffset, this.tileSize, this.source, this.fps, target, (p) => this.projectiles.splice(this.projectiles.findIndex(pr => pr.xOffset == p.xOffset && pr.yOffset == p.yOffset), 1))
        )
    }
    updateFps(fps) {
        this.fps = fps
        this.shootSprite.fps = fps
        this.projectiles.forEach(p => p.updateFps(fps))
    }
    #getAngle() {
        const xDiff = this.xOffset - this.target.x
        const yDiff = this.yOffset - this.target.y
        return Math.atan2(yDiff, xDiff) - Math.PI * 0.5
    }
    updateSize(x, y, tileSize) {
        this.xOffset = x
        this.yOffset = y - (this.source.img.source.height / 64 * tileSize - tileSize) + this.source.weapon.offset / 64 * tileSize
        this.size = this.source.weapon.img.source.width / 64 * tileSize
        this.tileSize = tileSize
        super.updateSize(0, 0, this.size, this.size)
        this.shootSprite.updateSize(0, 0, this.size, this.size)
        this.projectiles.forEach(p => p.updateSize(this.tileSize))
    }
    draw(c) {
        c.translate(this.xOffset + this.tileSize * 0.5, this.yOffset + this.tileSize * 0.5)
        if (this.turning) c.rotate(this.angle)
        c.translate(-this.size * 0.5, -this.size * 0.5)
        if (this.shooting > 0) {
            this.shootSprite.draw(c)
            this.shooting--
        } else {
            super.draw(c)
        }
        c.translate(this.size * 0.5, this.size * 0.5)
        if (this.turning) c.rotate(-this.angle)
        c.translate(-this.xOffset - this.tileSize * 0.5, -this.yOffset - this.tileSize * 0.5)
    }
}
function distance(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2))
}
import Sprite from "./Sprite.js"

export default class Projectile extends Sprite {
    constructor(x, y, angle, tileSize, source, fps, target) {
        super(x, y, source.projectile.img.source.width / 64 * tileSize, source.projectile.img.source.height / 64 * tileSize, source.projectile.img)
        this.x = x
        this.y = y
        this.angle = angle
        this.tileSize = tileSize
        this.source = source
        this.fps = fps
        this.width = source.projectile.img.source.width / 64 * tileSize
        this.height = source.projectile.img.source.height / 64 * tileSize
        this.xSpeed = Math.cos(angle) * source.projectile.speed * tileSize / 64 / this.fps
        this.ySpeed = Math.sin(angle) * source.projectile.speed * tileSize / 64 / this.fps
        super.updateSize(this.x, this.y, this.width, this.height)
    }
    updateFps(fps) {
        this.fps = fps
        this.xSpeed = Math.cos(angle) * source.projectile.speed * tileSize / 64 / this.fps
        this.ySpeed = Math.sin(angle) * source.projectile.speed * tileSize / 64 / this.fps
    }
    updateDimensions(tileSize) {
        this.x = this.x / this.tileSize * tileSize
        this.y = this.y / this.tileSize * tileSize
    }
    update(c) {
        console.log(this.x, this.y, this.width, this.height)
        super.draw(c)
        this.x += this.xSpeed
        this.y += this.ySpeed
    }
}
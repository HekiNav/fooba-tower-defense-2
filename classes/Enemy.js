import Sprite from "./Sprite.js"

export default class Enemy extends Sprite {
    constructor(source, path, tileSize, fps) {
        super(100, 100, tileSize, tileSize, source.img.idle, fps)
        this.source = source
        this.path = path
        this.tileSize = tileSize
        this.size = tileSize * 1
        this.x = 100
        this.y = 100
        this.target = path[0]
        this.status = "movement"
        super.changeImage(source.img[this.status])
        super.updateFps(fps)
    }
    updateDimensions(tileSize) {
        this.x = this.x / this.tileSize * tileSize
        this.y = this.y / this.tileSize * tileSize

        this.tileSize = tileSize
        this.size = tileSize * 1
        super.updateSize(this.x, this.y, this.size, this.size)
    }
    update(c) {
        super.draw(c)
    }
}
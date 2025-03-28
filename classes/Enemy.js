import Sprite from "./Sprite.js"

export default class Enemy extends Sprite {
    constructor(source, path, tileSize, fps) {
        super(100, 100, tileSize, tileSize, source.img.idle, fps)
        this.updated = false
        this.source = source
        this.path = path
        this.tileSize = tileSize
        this.size = tileSize * 1
        this.path.splice(0, 0, { x: this.path[0].x + Math.sign(this.path[0].x - this.path[1].x), y: this.path[0].y + Math.sign(this.path[0].y - this.path[1].y) })
        this.target = path[1]
        this.x = this.target.x * tileSize - tileSize * 0.5
        this.y = this.target.y * tileSize - tileSize * 0.5
        this.directionData = this.#getDirection()
        this.status = "movement"
        super.changeImage(source.img[this.status], this.directionData.name == "left" || this.directionData.name == "right" ? "sideways" : this.directionData.name, this.directionData.name == "right")
        super.updateFps(fps)

        this.health = this.source.health
        this.armor = this.source.armor
        this.shield = this.source.shield
        this.specialVariation = this.source.sizeVariation.special.some(s => {
            if (Math.random() <= s.chance) {
                this.size *= s.size
                this.health *= s.healthScale
                this.armor *= s.armorScale
                this.shield *= s.shieldScale
                return true
            }
        });
        if (!this.specialVariation) {
            const options = this.source.sizeVariation.ranging
            const variation = (Math.random() * (options.range[1] - options.range[0]) + options.range[0]).toFixed(1)
            if (options.healthScales) this.health *= variation
            if (options.armorScales) this.armor *= variation
            if (options.shieldScales) this.shield *= variation
        }
        this.maxhealth = this.health
        this.maxarmor = this.armor
        this.maxshield = this.shield
        this.#nextTarget()
    }
    updateDimensions(tileSize) {
        this.x = this.x / this.tileSize * tileSize
        this.y = this.y / this.tileSize * tileSize

        this.tileSize = tileSize
        this.size = tileSize * 1
        super.updateSize(this.x, this.y, this.size, this.size)
    }
    bar(c, x, y, color, percent, width, height) {
        if (!percent) return
        c.fillStyle = "gray"
        c.fillRect(x - width * 0.5, y, width, height)
        c.fillStyle = color
        c.fillRect(x - width * 0.5, y, width * percent, height)
    }
    update(c) {
        this.updated = true
        super.draw(c)
        this.x += this.directionData.x * this.source.speed
        this.y += this.directionData.y * this.source.speed
        if (this.#pastTarget()) {
            this.x = this.target.x * this.tileSize - this.tileSize * 0.5
            this.y = this.target.y * this.tileSize - this.tileSize * 0.5
            this.#nextTarget()
            super.changeImage(this.source.img[this.status], this.directionData.name == "left" || this.directionData.name == "right" ? "sideways" : this.directionData.name, this.directionData.name == "left")
        }
        const width = this.tileSize * 0.8
        const height = 0.05 * this.tileSize
        this.bar(c, this.x + this.tileSize * 0.5, this.y + height * 0, "blue", this.shield / this.maxshield, width, height)
        this.bar(c, this.x + this.tileSize * 0.5, this.y + height * 1, "yellow", this.armor / this.maxarmor, width, height)
        this.bar(c, this.x + this.tileSize * 0.5, this.y + height * 2, "red", this.health / this.maxhealth, width, height)
    }
    #pastTarget() {
        switch (this.directionData.name) {
            case "right":
                return this.x > this.target.x * this.tileSize - this.tileSize * 0.5;
            case "left":
                return this.x < this.target.x * this.tileSize - this.tileSize * 0.5;
            case "down":
                return this.y > this.target.y * this.tileSize - this.tileSize * 0.5;
            case "up":
                return this.y < this.target.y * this.tileSize - this.tileSize * 0.5;
        }
    }
    #nextTarget() {
        this.target = this.path[this.path.findIndex(p => p.x == this.target.x && p.y == this.target.y) + 1]
        if (!this.target) console.log("Reached End")
        this.directionData = this.#getDirection()
    }
    #getDirection() {
        const previousTarget = this.path[this.path.findIndex(p => p.x == this.target.x && p.y == this.target.y) - 1]
        const direction = {}

        if (previousTarget.x < this.target.x) direction.name = "right"
        else if (previousTarget.x > this.target.x) direction.name = "left"
        else if (previousTarget.y < this.target.y) direction.name = "down"
        else if (previousTarget.y > this.target.y) direction.name = "up"

        const xdiff = this.target.x - previousTarget.x
        const ydiff = this.target.y - previousTarget.y

        const ratio = Math.abs(1 / (xdiff + ydiff))
        direction.x = xdiff * ratio
        direction.y = ydiff * ratio
        return direction
    }
}
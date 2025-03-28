import Sprite from "./Sprite.js"

export default class Enemy extends Sprite {
    constructor(source, path, tileSize, fps) {
        super(100, 100, tileSize, tileSize, source.img.idle, fps)
        this.updated = false
        this.source = source
        this.path = path
        this.tileSize = tileSize
        this.size = tileSize * 1
        this.target = path[1]
        this.xPos = this.target.x * this.tileSize - this.tileSize * 0.5
        this.yPos = this.target.y * this.tileSize - this.tileSize * 0.5
        this.directionData = this.#getDirection()
        this.status = "movement"
        super.changeImage(source.img[this.status], this.directionData.name == "left" || this.directionData.name == "right" ? "sideways" : this.directionData.name, this.directionData.name == "right")
        super.updateFps(fps)

        this.health = this.source.health
        this.armor = this.source.armor
        this.shield = this.source.shield
        this.specialVariation = this.source.sizeVariation.special.some(s => {
            if (Math.random() <= s.chance) {
                this.sizeMultiplier = s.size
                this.health *= s.healthScale
                this.armor *= s.armorScale
                this.shield *= s.shieldScale
                return true
            }
        });
        if (!this.specialVariation) {
            const options = this.source.sizeVariation.ranging
            const variation = (Math.random() * (options.range[1] - options.range[0]) + options.range[0]).toFixed(1)
            this.sizeMultiplier = variation
            if (options.healthScales) this.health *= variation
            if (options.armorScales) this.armor *= variation
            if (options.shieldScales) this.shield *= variation
        }
        this.maxhealth = this.health
        this.maxarmor = this.armor
        this.maxshield = this.shield
        console.log(this.path)
        super.updateDuration(this.imagesource.duration * this.sizeMultiplier)
        this.xPos = this.path[0].x * this.tileSize - this.tileSize * 0.5
        this.yPos = this.path[0].y * this.tileSize - this.tileSize * 0.5
        this.#nextTarget()
        this.updateDimensions(this.tileSize)
    }
    updateDimensions(tileSize) {
        this.xPos = this.xPos / this.size * (tileSize * this.sizeMultiplier)
        this.yPos = this.yPos / this.size * (tileSize * this.sizeMultiplier)

        this.tileSize = tileSize
        this.size = this.tileSize * this.sizeMultiplier

        super.updateSize(this.xPos - (this.size - this.tileSize) * 0.5, this.yPos - (this.size - this.tileSize) * 0.5, this.size, this.size)
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
        super.updateSize(this.xPos - (this.size - this.tileSize) * 0.5, this.yPos - (this.size - this.tileSize) * 0.5, this.size, this.size)
        super.draw(c)
        this.xPos += this.directionData.x * this.source.speed * this.tileSize / 64
        this.yPos += this.directionData.y * this.source.speed * this.tileSize / 64
        if (this.#pastTarget()) {
            this.xPos = this.target.x * this.tileSize - this.tileSize * 0.5
            this.yPos = this.target.y * this.tileSize - this.tileSize * 0.5
            this.#nextTarget()
            super.changeImage(this.source.img[this.status], this.directionData.name == "left" || this.directionData.name == "right" ? "sideways" : this.directionData.name, this.directionData.name == "left")
        }
        const width = this.tileSize * 0.8
        const height = 0.05 * this.tileSize
        this.bar(c, this.x + this.size * 0.5, this.y + (this.size - this.tileSize) * 0.5 + height * 0, "blue", this.shield / this.maxshield, width, height)
        this.bar(c, this.x + this.size * 0.5, this.y + (this.size - this.tileSize) * 0.5 + height * 1, "yellow", this.armor / this.maxarmor, width, height)
        this.bar(c, this.x + this.size * 0.5, this.y + (this.size - this.tileSize) * 0.5 + height * 2, "red", this.health / this.maxhealth, width, height)
    }
    #pastTarget() {
        switch (this.directionData.name) {
            case "right":
                return this.xPos > this.target.x * this.tileSize - this.tileSize * 0.5;
            case "left":
                return this.xPos < this.target.x * this.tileSize - this.tileSize * 0.5;
            case "down":
                return this.yPos > this.target.y * this.tileSize - this.tileSize * 0.5;
            case "up":
                return this.yPos < this.target.y * this.tileSize - this.tileSize * 0.5;
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
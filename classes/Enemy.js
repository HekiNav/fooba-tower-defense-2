import Sprite from "./Sprite.js"

export default class Enemy extends Sprite {
    constructor(source, path, tileSize, fps, destroy, updateCoins, updateHp) {
        super(100, 100, tileSize, tileSize, source.img.idle, fps)
        this.updated = false
        this.source = source
        this.path = path
        this.tileSize = tileSize
        this.width = tileSize * 1
        this.height = tileSize * 1
        this.target = path[1]
        this.directionData = this.#getDirection()
        this.status = "movement"
        super.changeImage(source.img[this.status], this.directionData.name == "left" || this.directionData.name == "right" ? "sideways" : this.directionData.name, this.directionData.name == "right")
        super.updateFps(fps)
        this.destroy = destroy
        this.updateHp = updateHp
        this.updateCoins = updateCoins
        this.health = this.source.health
        this.armor = this.source.armor
        this.shield = this.source.shield
        this.reward = this.source.reward
        this.specialVariation = this.source.sizeVariation.special.some(s => {
            if (Math.random() <= s.chance) {
                this.sizeMultiplier = s.size
                this.health *= s.healthScale
                this.armor *= s.armorScale
                this.shield *= s.shieldScale
                this.reward = s.reward
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
        super.updateDuration(this.imagesource.duration * this.sizeMultiplier)
        this.xPos = this.target.x * this.tileSize - this.tileSize * 0.5
        this.yPos = this.target.y * this.tileSize - this.tileSize * 0.5
        this.width = tileSize * this.source.width * this.sizeMultiplier
        this.height = tileSize * this.source.height * this.sizeMultiplier
        super.updateSize(this.xPos - (this.width - this.tileSize) * 0.5, this.yPos - (this.height - this.tileSize) * 0.5, this.width, this.height)
        this.#nextTarget()
    }
    hit(damage, armorPiercing, shieldPiercing, stun) {
        if (this.shield > 0)
            this.shield -= damage.shield
        if (this.shield <= 0 || shieldPiercing)
            this.armor -= damage.armor
        if (this.armor <= 0 || armorPiercing)
            this.health -= damage.health

        if (this.shield < 0) this.shield = 0
        if (this.armor < 0) this.armor = 0
        if (this.health <= 0) {
            this.updateCoins(this.reward)
            this.destroy(this)
        }
    }
    updateDimensions(tileSize) {
        this.xPos = this.xPos / this.width * (tileSize * this.sizeMultiplier)
        this.yPos = this.yPos / this.height * (tileSize * this.sizeMultiplier)

        this.tileSize = tileSize
        this.width = this.tileSize * this.source.width * this.sizeMultiplier
        this.height = this.tileSize * this.source.height * this.sizeMultiplier
        super.updateSize(this.xPos - (this.width - this.tileSize) * 0.5, this.yPos - (this.height - this.tileSize) * 0.5, this.width, this.height)
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
        super.updateSize(this.xPos - (this.width - this.tileSize) * 0.5, this.yPos - (this.height - this.tileSize) * 0.5, this.width, this.height)
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
        this.bar(c, this.x + this.width * 0.5, this.y + (this.height - this.tileSize) * 0.5 + height * 0, "blue", this.shield / this.maxshield, width, height)
        this.bar(c, this.x + this.width * 0.5, this.y + (this.height - this.tileSize) * 0.5 + height * 1, "yellow", this.armor / this.maxarmor, width, height)
        this.bar(c, this.x + this.width * 0.5, this.y + (this.height - this.tileSize) * 0.5 + height * 2, "red", this.health / this.maxhealth, width, height)
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
        if (!this.target) {
            this.updateHp(Math.round(-this.reward / 10))
            this.destroy(this)
            return
        }
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
export default class Tile {
    constructor(x, y, size, images = [], building = null) {
        this.tower = null
        this.selected = false
        this.hovered = false
        this.building = building
        this.x = x
        this.y = y
        this.size = size
        this.level = 0
        this.images = []
        images.forEach(img => {
            let image = new Image()
            image.src = img.url
            this.images.push({
                imagesrc: img,
                image: image
            })
        });
    }
    updateFps(fps) {
        if (this.tower) this.tower.updateFps(fps)
    }
    updateSize(x, y, size) {
        this.x = x
        this.y = y
        this.size = size
        if (this.tower) this.tower.updateDimensions(x, y, size)
    }
    updateImage(imagesrc) {
        this.imagesrc = { url: imagesrc.url, x: imagesrc.x, y: imagesrc.y, size: imagesrc.size }
        this.image = new Image()
        this.image.src = this.imagesrc.url
        this.building = imagesrc.building ? imagesrc.building : null
    }
    update(c, tileDraw, enemies) {
        const enemiesNearby = enemies.filter(e => Math.abs(e.x / this.size - this.x / this.size) <= 1.5 && Math.abs(e.y / this.size - this.y / this.size) <= 1.5)
        if (tileDraw || (enemiesNearby)) this.draw(c)
    }
    updateTower(c, enemies) {
        if (this.tower) this.tower.update(c, enemies)
    }
    draw(c) {
        const scaleOffset = 1.01
        this.images.forEach(img => {
            c.drawImage(img.image, img.imagesrc.x * img.imagesrc.size, img.imagesrc.y * img.imagesrc.size, img.imagesrc.size, img.imagesrc.size, this.x - scaleOffset * 0.5, this.y - scaleOffset * 0.5, this.size * scaleOffset, this.size * scaleOffset)
        })
        if (this.selected && this.building) {
            c.strokeStyle = "#0005"
            c.lineWidth = 8
            c.beginPath()
            c.rect(this.x + 2, this.y + 2, this.size - 6, this.size - 6)
            c.stroke()
        } else if (this.selected) {
            c.strokeStyle = "#0005"
            c.lineWidth = 4
            c.beginPath()
            c.rect(this.x + 2, this.y + 2, this.size - 4, this.size - 4)
            c.stroke()
        }
        if (this.hovered && this.building) {
            c.fillStyle = "#fff5"
            c.beginPath()
            c.rect(this.x, this.y, this.size, this.size)
            c.fill()
        }
    }
}
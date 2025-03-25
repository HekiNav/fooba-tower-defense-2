export default class Tile {
    constructor(x, y, size, layer, imagesrc, building = null) {
        this.active = false
        this.hovered = false
        this.building = building
        this.x = x
        this.y = y
        this.layer = layer
        this.size = size
        if (imagesrc) {
            this.imagesrc = imagesrc
            this.image = new Image()
            this.image.src = this.imagesrc.url
        }
    }
    updateSize(x, y, size) {
        this.x = x
        this.y = y
        this.size = size
    }
    updateImage(imagesrc) {
        this.imagesrc = {url: imagesrc.url, x: imagesrc.x, y: imagesrc.y, size: imagesrc.size, layer: this.layer}
        this.image = new Image()
        this.image.src = this.imagesrc.url
        this.building = imagesrc.building ? imagesrc.building : null
    }
    draw(c) {
        if (this.imagesrc) {
            c.drawImage(this.image, this.imagesrc.x * this.imagesrc.size, this.imagesrc.y * this.imagesrc.size, this.imagesrc.size, this.imagesrc.size, this.x, this.y, this.size, this.size)
        } else {
            c.fillStyle = "#3f50"
            c.beginPath()
            c.rect(this.x, this.y, this.size, this.size)
            c.fill()
        }
        if (this.active) {
            c.strokeStyle = "#0005"
            c.lineWidth = 4
            c.beginPath()
            c.rect(this.x + 2, this.y + 2, this.size - 4, this.size - 4)
            c.stroke()
        }
        if (this.hovered) {
            c.fillStyle = "#fff5"
            c.beginPath()
            c.rect(this.x, this.y, this.size, this.size)
            c.fill()
        }
    }
}
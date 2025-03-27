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
    update(c) {
        this.draw(c)
        if (this.tower) this.tower.update(c)
    }
    draw(c) {
        const scaleOffset = 1.01
        this.images.forEach(img => {
            c.drawImage(img.image, img.imagesrc.x * img.imagesrc.size, img.imagesrc.y * img.imagesrc.size, img.imagesrc.size, img.imagesrc.size, this.x - scaleOffset * 0.5, this.y - scaleOffset * 0.5, this.size * scaleOffset, this.size * scaleOffset)
        })
        if (this.selected && this.building) {
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
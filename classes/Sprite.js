export default class Sprite {
    constructor(x, y, width, height, image) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.imagesource = image
        this.image = new Image()
        this.image.src = image.source.url
    }
    updateSize(x, y, width, height) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
    }
    draw(c) {
        if (this.imagesource.animated) {

        } else {
            c.drawImage(this.image, this.imagesource.source.x * this.imagesource.source.width, this.imagesource.source.y * this.imagesource.source.height, this.imagesource.source.width, this.imagesource.source.height, this.x, this.y, this.width, this.height)
        }

    }

}
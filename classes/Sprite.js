export default class Sprite {
    constructor(x, y, width, height, image, fps = null) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.imagesource = image
        this.image = new Image()
        this.image.src = image.source.url
        this.ticks = 0
        this.fps = fps
        this.frameTicks = 10
        this.frames = []
        this.direction = "sideways"
        this.reverse = false
        if (fps) {
            this.frames = this.#generateFrames(image)
            console.log(image)
            this.frameTicks = this.imagesource.duration / 1000 * this.fps / this.frames.length
        }

    }
    #generateFrames(image) {
        switch (image.source.x_type) {
            case "range_up_down":
                const a1 = []
                for (let i = image.source.x[0]; i <= image.source.x[1]; i++) {
                    a1.push(i)
                }
                for (let i = image.source.x[1]; i >= image.source.x[0]; i--) {
                    a1.push(i)
                }
                return a1
            case "range_up":
                const a2 = []
                for (let i = image.source.x[0]; i <= image.source.x[1]; i++) {
                    a2.push(i)
                }
                return a2
            case "array":
                return image.source.x
            case "constant":
                return [image.source.x]
        }
    }
    updateSize(x, y, width, height) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
    }
    updateFps(fps) {
        this.fps = fps
        this.frameTicks = this.imagesource.duration / 1000 * this.fps / this.frames.length
    }
    changeImage(img, direction, reverse) {
        this.imagesource = img
        this.image.src = img.source.url
        this.frames = this.#generateFrames(this.imagesource)
        this.frameTicks = this.imagesource.duration / 1000 * this.fps / this.frames.length
        this.direction = direction
        this.reverse = reverse
    }
    draw(c) {
        if (this.imagesource.animated) {
            const frame = Math.floor((this.ticks % (this.frames.length * this.frameTicks)) / this.frameTicks)
            this.ticks++
            if (this.reverse) c.save()
            if (this.reverse) c.scale(-1, 1)
            c.drawImage(this.image, this.frames[frame] * this.imagesource.source.width, [this.imagesource.source.y_type == "directions" ? this.imagesource.source.y[this.direction] : this.imagesource.source.y] * this.imagesource.source.height, this.imagesource.source.width, this.imagesource.source.height, this.x * (this.reverse ? -1 : 1), this.y, this.width * (this.reverse ? -1 : 1), this.height)
            if (this.reverse) c.restore()
        } else {
            c.drawImage(this.image, this.imagesource.source.x * this.imagesource.source.width, this.imagesource.source.y * this.imagesource.source.height, this.imagesource.source.width, this.imagesource.source.height, this.x, this.y, this.width, this.height)
        }

    }

}
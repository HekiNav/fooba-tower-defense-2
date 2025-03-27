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
        if (fps) {
            this.frames = this.#generateFrames(image)
            this.frameTicks = this.imagesource.duration / 1000 * this.fps / this.frames.length
        }

    }
    #generateFrames(image) {
        console.log(image.source.x_type)
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
    changeImage(img) {
        this.imagesource = img
        this.image.src = img.source.url
        this.frames = this.#generateFrames(this.imagesource)
        this.frameTicks = this.imagesource.duration / 1000 * this.fps / this.frames.length
    }
    draw(c) {
        if (this.imagesource.animated) {
            const frame = Math.floor((this.ticks % (this.frames.length * this.frameTicks)) / this.frameTicks)
            this.ticks++
            c.drawImage(this.image, this.frames[frame] * this.imagesource.source.width, this.imagesource.source.y.sideways * this.imagesource.source.height, this.imagesource.source.width, this.imagesource.source.height, this.x, this.y, this.width, this.height)
        } else {
            c.drawImage(this.image, this.imagesource.source.x * this.imagesource.source.width, this.imagesource.source.y * this.imagesource.source.height, this.imagesource.source.width, this.imagesource.source.height, this.x, this.y, this.width, this.height)
        }

    }

}
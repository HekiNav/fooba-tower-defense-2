export default class Sprite {
    constructor(x, y, width, height, image) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.source = image
        this.image = new Image()
        this.image.src = image.img.source.url   
    }   
    updateSize(x, y, width, height) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
    }
    draw(c){
        if (this.source.img.animated) {

        } else {
            c.drawImage(this.image, this.source.img.source.x * this.source.img.source.width, this.source.img.source.y * this.source.img.source.height, this.source.img.source.width, this.source.img.source.height, this.x, this.y, this.width, this.height)
        }
        
    }
    
}
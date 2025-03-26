export default class PreviewBuilding{
    constructor(x, y, source, tileSize){
        this.source = source
        this.height = this.source.img.source.height / this.source.img.source.width * tileSize
        this.x = x
        this.y = y - this.height + 30
        this.width = tileSize
        this.projectiles = []
        this.target = null
        this.image = new Image()
        this.image.src = source.img.source.url
    }
    draw(c){
        c.drawImage(this.image, this.source.img.source.x * this.source.img.source.width, this.source.img.source.y * this.source.img.source.height, this.source.img.source.width, this.source.img.source.height, this.x, this.y, this.width, this.height)
 
        c.beginPath()
        c.arc(this.x + 32,this.y + 32, this.radius, 0, Math.PI * 2)
        c.fillStyle = 'rgba(0,0,0,0.05)'
        c.fill()       
    }
    /* shoot() {
            this.projectiles.push(
                new Projectile({
                    position: {
                        x: this.position.x + 32,
                        y: this.position.y - 32
                    },
                    enemy: this.target,
                    level: this.level
                })
            )
        } */
    updateSize(x, y, size) {
        this.x = x
        this.y = y
        this.size = size
    }
    update(c){ 
        this.draw(c)
        /* if (this.target !== undefined && this.frames.current.x === 11 && this.frames.elapsed % 5 === 0) {this.shoot()} */
    }
}
import Sprite from "./Sprite.js"

export default class Building extends Sprite{
    constructor(x, y, source, tileSize){
        super(x,y,tileSize, tileSize,source)
        this.source = source
        this.height = this.source.img.source.height / this.source.img.source.width * tileSize
        this.width = tileSize
        this.x = x
        this.y = y - this.height + tileSize
        this.projectiles = []
        this.target = null
        super.updateSize(this.x, this.y, this.width, this.height)
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
        super.draw(c)
        /* if (this.target !== undefined && this.frames.current.x === 11 && this.frames.elapsed % 5 === 0) {this.shoot()} */
    }
}
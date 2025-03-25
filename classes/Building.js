export default class Building{
    constructor(x, y, source){
        this.source = source
        this.x = x
        this.y = y
        this.projectiles = []
        this.target = null
        this.image = new Image()
        this.image.src = source.img.src
    }
    draw(c){

        c.drawImage(this.image, this.source.image.x * this.source.image.width, this.source.image.y * this.source.image.height, this.source.image.width, this.source.image.height, this.x, this.y, this.size, this.size)
 
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
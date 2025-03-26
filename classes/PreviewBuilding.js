import Building from "./Building.js"

export default class PreviewBuilding extends Building{
    constructor(x, y, source, tileSize){
        super(x, y, source, tileSize)
        this.source = source
        this.height = this.source.img.source.height / this.source.img.source.width * tileSize
        this.x = x
        this.y = y - this.height + 30
        this.width = tileSize
    }   
}
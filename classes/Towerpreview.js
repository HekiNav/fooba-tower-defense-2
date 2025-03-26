import PreviewBuilding from "./PreviewBuilding.js"
import Tile from "./Tile.js"

export default class TowerPreview{
    constructor(canvas, tower, background) {
        this.canvas = canvas
        this.tower = tower
        this.background = background
        this.tileSize = 30
        this.c = this.canvas.getContext("2d")
        this.tiles = this.#generateTiles(this.background.tiles)
        this.canvas.width = this.background.width * this.tileSize
        this.canvas.height = this.background.height * this.tileSize

        this.building = new PreviewBuilding(this.tileSize, this.tileSize, this.tower, this.tileSize)
        console.log(this.tiles)
    }
    #generateTiles(cf) {
        const tiles = []
        for (let i = 0; i < cf.length; i++) {
            const tile = cf[i];
            console.log(tile)
            tiles.push(new Tile(i % this.background.width * this.tileSize, Math.floor(i / this.background.height) * this.tileSize, this.tileSize, tile.images))
        }
        return tiles
    }
    draw(){
        this.c.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.tiles.forEach(tile => {
            tile.draw(this.c)
        });
        this.building.draw(this.c)
    }
}
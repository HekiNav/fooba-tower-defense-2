import Tile from "./Tile.js"

export default class Tileselector{
    constructor(canvas, tileconfig, width) {
        this.width = width
        this.canvas = canvas
        this.config = tileconfig
        this.tileSize = 30
        this.c = this.canvas.getContext("2d")
        this.tiles = this.#generateTiles(tileconfig)
        this.canvas.addEventListener("mousedown", e => this.#handleMouseDown(e))
        this.canvas.addEventListener("mousemove", e => this.#handleMouseMove(e))
        this.canvas.addEventListener("mouseout", e => this.#handleMouseOut(e))
        this.canvas.width = width * this.tileSize
        this.canvas.height = Math.ceil(tileconfig.length / width) * this.tileSize
        this.#movableContainer()
        this.mouse = {
            offset: {x:0,y:0},
            down: false
        }
    }
    #generateTiles(cf) {
        const tiles = []
        for (let i = 0; i < cf.length; i++) {
            const tileconfig = cf[i];
            tiles.push(new Tile(i % this.width * this.tileSize, Math.floor(i / this.width) * this.tileSize, this.tileSize, 0, tileconfig.source))
        }
        return tiles
    }
    draw(){
        this.c.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.tiles.forEach(tile => {
            tile.draw(this.c)
        });
    }
    selectedTile(){
        return this.tiles.find(t => t.active)
    }
    #handleMouseDown(e){
        this.tiles.forEach((tile)=>{tile.active = false;})
        if (this.#getMouseTile(e) != null) this.tiles[this.#getMouseTile(e)].active = true
    }
    #handleMouseMove(e){
        this.tiles.forEach((tile)=>{tile.hovered = false;})
        if (this.#getMouseTile(e) != null) this.tiles[this.#getMouseTile(e)].hovered = true
    }
    #handleMouseOut(e){
        this.tiles.forEach((tile)=>{tile.hovered = false;})
    }
    #getMouseTile(e){
        for (let i = 0; i < this.tiles.length; i++) {
            let tile = this.tiles[i]
            if (tile.x <= e.offsetX && e.offsetX <= tile.x + this.tileSize && tile.y <= e.offsetY && e.offsetY <= tile.y + this.tileSize) return i
        }
        return null
    }
    #movableContainer(){
        const c = this.canvas.parentElement
        c.addEventListener("mousedown", e => {
            this.mouse.down = true
            this.mouse.offset = {x: e.offsetX, y: e.offsetY}
        })
        window.addEventListener("mouseup", () => this.mouse.down = false)
        window.addEventListener("mousemove", e => {
            if (!this.mouse.down) return
            c.style.top = e.clientY - this.mouse.offset.y + "px"
            c.style.left = e.clientX - this.mouse.offset.x + "px"
        })

    }
}
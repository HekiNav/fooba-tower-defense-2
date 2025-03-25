import Building from "./classes/Building.js"
import Tile from "./classes/Tile.js"
const canvas = document.getElementById("canvas")

const c = canvas.getContext("2d")


let mouse = {
    offset: {x:0,y:0},
    down: false
}
let coins = 50
var coinTXT = document.getElementById('coins')
let map = null
let tiles = null
let buildings = []
let buildable = []
let tileSize = 10
const map1 = getFile("maps/bug_bridge.ftdmap.json")
const bdings = getFile("data/buildings.json")
Promise.all([map1, bdings]).then(([map1, bdings]) => {
    tiles = loadTiles(map1.tiles)
    map = map1
    buildable = bdings
    update()
    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("mouseout", handleMouseOut)
    canvas.addEventListener("click", handleClick)
})

function loadTiles(raw) {
    let tiles = []
    raw.forEach(t => {
        tiles.push(new Tile(0, 0, 64, t.images, t.building))
    })
    return tiles
}
function reloadTiles(tiles) {
    for (let i = 0; i < map.height; i++) {
        for (let j = 0; j < map.width; j++) {
            tiles[i * map.width + j].updateSize(j * tileSize, i * tileSize, tileSize)     
        }
    }
}
function getMouseTile(e) {
    for (let i = 0; i < map.height; i++) {
        if (i * tileSize <= e.offsetY && (i + 1) * tileSize >= e.offsetY) {
            for (let j = 0; j < map.width; j++) {
                if (j * tileSize <= e.offsetX && (j + 1) * tileSize >= e.offsetX)  {
                    return i * map.width + j
                }
            }
        }
    }
    return null
}
async function getFile(filename) {
    const response = await fetch("/" + filename)
    return await response.json()
}
function update() {
    const step = 0.1
    const scale = 1
    tileSize = Math.floor((window.innerHeight * scale / map.height > window.innerWidth * 0.7 * scale / map.width ? window.innerWidth * 0.7 * scale / map.width : window.innerHeight * scale / map.height) / step) * step
    canvas.style.transform = `scale(${1/scale})`
    if (window.innerHeight / map.height >= window.innerWidth * 0.7 / map.width) {
        canvas.width = window.innerWidth * 0.7 * scale
        canvas.style.width = window.innerWidth * 0.7
        canvas.height = window.innerWidth * 0.7 * scale * (map.height / map.width)
        canvas.style.height = window.innerWidth * 0.7 * (map.height / map.width)
    } else {
        canvas.height = window.innerHeight * scale
        canvas.style.height = window.innerHeight
        canvas.width = window.innerHeight * scale * (map.width / map.height)
        canvas.style.width = window.innerHeight * (map.width / map.height)
    }
    reloadTiles(tiles)
    tiles.forEach(tile => {
        tile.draw(c)
    })
    buildings.forEach(building => {
        building.update(c)

    })



    window.requestAnimationFrame(update)
}


function handleMouseMove(e){
    tiles.forEach(t => t.hovered = false)
    if (getMouseTile(e) != null) tiles[getMouseTile(e)].hovered = true
}
function handleClick(e){
    tiles.forEach(t => t.selected = false)
    if (getMouseTile(e) != null) tiles[getMouseTile(e)].selected = true
    const activeTile = tiles.find(t => t.selected)
    if (activeTile) {
        if (coins >= 50 * (activeTile.level + 1)) {
            activeTile.level ++
            if (activeTile.level === 2) {
                for (let i = 0; i < buildings.length; i++) {
                    console.log(buildings[i].position,activeTile.position)
                    if (buildings[i].position.x == activeTile.position.x && buildings[i].position.y == activeTile.position.y) {
                        buildings.splice(i,1)
                    }
                }
            }
            if (activeTile.level === 3) {
                for (let i = 0; i < buildings.length; i++) {
                    console.log(buildings[i].position,activeTile.position)
                    if (buildings[i].position.x == activeTile.position.x && buildings[i].position.y == activeTile.position.y) {
                        buildings.splice(i,1)
                    }
                }
            }
            buildings.push(
                new Building(activeTile.x, activeTile.y, )
            )
            //coins -= 50 * activeTile.level
            coinTXT.innerHTML =  coins
        }
        buildings.sort((a, b) => a.position.y - b.position.y)
    }
    buildings.sort((a, b) => {
        return a.position.y - b.position.y
    })
}
function handleMouseOut(e){
    tiles.forEach((tile)=>{tile.hovered = false;})
}


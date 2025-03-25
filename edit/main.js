import Tile from "./classes/Tile.js"
import Tileselector from "./classes/Tileselector.js"

const tileCanvas = document.getElementById("tileCanvas")
const canvas = document.getElementById("canvas")

const c = canvas.getContext("2d")

const urlParam = (window.location.href.split("?")[1] || window.location.href.split("?")[0]).split("&").map(e => e.split("=")).reduce((prev, cur) => ({ ...prev, [cur[0]]: cur[1] }), {})
let mouseDown
let tileSelector
getFile("tiles.json").then(e => {
    tileSelector = new Tileselector(tileCanvas, e, 16)
})
let mouse = {
    offset: { x: 0, y: 0 },
    down: false
}
let editingEnemyPath = false
let enemyPath = []
let layer = 1
let tileSize = 0
let tiles = generateTiles(localStorage.getItem("ftdSavedMap"))

const difficulties = ["Easy", "Medium", "Hard"]

movableContainer()

//Reload with parameters if they are missing to avoid errors
if (!urlParam.height || !urlParam.width) window.location.href = window.location.href.split("?")[0] + "?width=16&height=8"


function generateTiles(savedMap) {
    let map
    if (savedMap) {
        map = JSON.parse(savedMap)
        enemyPath = map.enemyPath
    }
    localStorage.removeItem("ftdSavedMap")
    const tiles = []
    for (let h = 1; h < 4; h++) {
        for (let i = 0; i < urlParam.height; i++) {
            for (let j = 0; j < urlParam.width; j++) {
                let imgsrc
                if (savedMap) {
                    if (map.tiles[i * urlParam.width + j].building && h == 3) {
                        imgsrc = map.tiles[i * urlParam.width + j].building == "normal" ? { "url": "/edit/img/other.png", "size": 64, "x": 0, "y": 0, "building": "normal" } : { "url": "/edit/img/other.png", "size": 64, "x": 1, "y": 0, "building": "boosted" }
                    } else {
                        imgsrc = map.tiles[i * urlParam.width + j].images.find(i => i.layer == h)
                    }
                }
                tiles.push(new Tile(j * tileSize, i * tileSize, tileSize, h, imgsrc))
            }
        }
    }

    return tiles
}
function reloadTiles(tiles) {
    for (let i = 0; i < urlParam.height; i++) {
        for (let j = 0; j < urlParam.width; j++) {
            tiles[(layer - 1) * urlParam.height * urlParam.width + (i * urlParam.width + j)].updateSize(j * tileSize, i * tileSize, tileSize)
        }
    }
}
function getMouseTile(e) {
    for (let i = 0; i < urlParam.height; i++) {
        if (i * tileSize <= e.offsetY && (i + 1) * tileSize >= e.offsetY) {
            for (let j = 0; j < urlParam.width; j++) {
                if (j * tileSize <= e.offsetX && (j + 1) * tileSize >= e.offsetX) {
                    return (layer - 1) * urlParam.height * urlParam.width + (i * urlParam.width + j)
                }
            }
        }
    }
    return null
}
async function getFile(filename) {
    const response = await fetch("/edit/data/" + filename)
    return await response.json()
}
function renderEnemyPath() {
    if (!enemyPath.length) return
    enemyPath.forEach((pos, i) => {
        const nextPos = enemyPath[i + 1]
        let color
        if (i == 0) color = "red"
        else if (i == enemyPath.length - 1) color = "green"
        else color = "blue"
        c.fillStyle = color
        c.strokeStyle = "blue"
        if (nextPos) {
            c.beginPath()
            c.moveTo(pos.x * tileSize, pos.y * tileSize)
            c.lineTo(nextPos.x * tileSize, nextPos.y * tileSize)
            c.stroke()
        }

        c.beginPath()
        c.arc(pos.x * tileSize, pos.y * tileSize, tileSize * 0.1, 0, Math.PI * 2)
        c.fill()
    });
}
function update() {
    const step = 0.1
    const scale = 1
    tileSize = Math.floor((window.innerHeight * scale / urlParam.height > window.innerWidth * scale / urlParam.width ? window.innerWidth * scale / urlParam.width : window.innerHeight * scale / urlParam.height) / step) * step
    canvas.style.transform = `scale(${1 / scale})`
    if (window.innerHeight / urlParam.height >= window.innerWidth / urlParam.width) {
        canvas.width = window.innerWidth * scale
        canvas.style.width = window.innerWidth
        canvas.height = window.innerWidth * scale * (urlParam.height / urlParam.width)
        canvas.style.height = window.innerWidth * (urlParam.height / urlParam.width)
    } else {
        canvas.height = window.innerHeight * scale
        canvas.style.height = window.innerHeight
        canvas.width = window.innerHeight * scale * (urlParam.width / urlParam.height)
        canvas.style.width = window.innerHeight * (urlParam.width / urlParam.height)
    }
    reloadTiles(tiles)
    tiles.forEach(tile => {
        tile.size = tileSize
        if (tile.layer <= layer) tile.draw(c)
    })
    if (tileSelector) tileSelector.draw()
    renderEnemyPath(c, tileSize)
    window.requestAnimationFrame(update)
}
document.getElementById("save").addEventListener("mousedown", save)
document.getElementById("load").addEventListener("mousedown", load)
canvas.addEventListener("mousemove", handleMouseMove)
window.addEventListener("mousedown", handleMouseDown)
window.addEventListener("mouseup", handleMouseUp)
canvas.addEventListener("mouseout", handleMouseOut)
canvas.addEventListener("click", handleClick)
function handleMouseDown(e) {
    mouseDown = true
}
function handleMouseUp(e) {
    mouseDown = false
}
function handleMouseMove(e) {
    if (getMouseTile(e) != null && mouseDown && !tileSelector.mouse.down && !mouse.down) tiles[getMouseTile(e)].updateImage(tileSelector.selectedTile().imagesrc)
    tiles.forEach((tile) => { tile.hovered = false; })
    if (getMouseTile(e) != null) tiles[getMouseTile(e)].hovered = true
}
function handleClick(e) {
    if (getMouseTile(e) != null && !editingEnemyPath) tiles[getMouseTile(e)].updateImage(tileSelector.selectedTile().imagesrc)
    console.log(getMouseTile(e) != null, editingEnemyPath)
    if (getMouseTile(e) != null && editingEnemyPath) {
        let tile = tiles[getMouseTile(e)]
        enemyPath.push({ x: tile.x / tile.size + 0.5, y: tile.y / tile.size + 0.5 })
    }
}
function handleMouseOut(e) {
    tiles.forEach((tile) => { tile.hovered = false; })
}
function selectLayer(l) {
    layer = l
    const buttons = document.getElementById("layer").children
    for (let i = 0; i < buttons.length; i++) {
        const element = buttons.item(i);
        if (element.id == l) {
            element.style.background = "#555"
        } else {
            element.style.background = "#bbb"
        }
    }
}
function movableContainer() {
    const c = document.getElementById("layers")
    c.addEventListener("mousedown", e => {
        mouse.down = true
        mouse.offset = { x: e.offsetX, y: e.offsetY }
    })
    window.addEventListener("mouseup", () => mouse.down = false)
    c.addEventListener("mouseup", () => mouse.down = false)
    window.addEventListener("mousemove", e => {
        if (!mouse.down) return
        if (!document.getElementById("lock").classList.contains("unlocked")) return
        c.style.top = e.clientY - mouse.offset.y + "px"
        c.style.left = e.clientX - mouse.offset.x + "px"
    })

}
function save() {
    const map = []
    for (let i = 0; i < urlParam.width * urlParam.height; i++) {
        map.push({ images: [], building: null })
    }
    for (let i = 0; i < tiles.length; i++) {
        const t = tiles[i]
        const index = i % (urlParam.height * urlParam.width)
        if (t.building) map[index].building = t.building
        else if (t.imagesrc) map[index].images.push(t.imagesrc)
    }
    const name = document.getElementById("mapName").value
    const difficulty = document.getElementById("mapDifficulty").value
    if (!name.length) { alert("Please give the map a name in Map Attributes"); return }
    const file = {
        "name": name,
        "difficulty": difficulty,
        "enemyPath": enemyPath,
        "width": 16,
        "height": 8,
        "tiles": map
    }
    const element = document.createElement('a')
    element.setAttribute('href', `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(file))}`)
    let a = window.prompt("Filename?", "map")
    if (!a.length) return
    const fileName = `${a}.ftdmap.json`
    element.setAttribute('download', fileName)
    element.click()
}
function load() {
    const element = document.createElement('input')
    element.setAttribute('type', "file")
    element.setAttribute('accept', ".ftdmap.json")
    element.addEventListener("change", e => {
        if (!element.files.length) return
        element.files[0].text().then(file => {
            const map = JSON.parse(file)
            localStorage.setItem("ftdSavedMap", JSON.stringify(map))
            window.location.replace(window.location.href.split("?")[0] + `?width=${map.width}&height=${map.height}`)
        })
    })
    element.click()

}
selectLayer(1)
update()
document.querySelector(".lock").addEventListener("click", () => document.querySelector(".lock").classList.toggle("unlocked"))


document.getElementById("mapDifficulty").addEventListener("change", e => document.querySelector('label[for="mapDifficulty"]').innerHTML = `Difficulty: ${difficulties[e.target.value - 1]}`)
document.getElementById("1").addEventListener("click", () => selectLayer(1))
document.getElementById("2").addEventListener("click", () => selectLayer(2))
document.getElementById("3").addEventListener("click", () => selectLayer(3))

document.getElementById("path").addEventListener("click", e => {
    editingEnemyPath = !editingEnemyPath
    e.target.classList.toggle("active")
})

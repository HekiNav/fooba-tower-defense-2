import Building from "./classes/Building.js"
import Enemy from "./classes/Enemy.js"
import Tile from "./classes/Tile.js"
import TowerPreview from "./classes/Towerpreview.js"
const canvas = document.getElementById("canvas")
const canvasC = document.getElementById("canvasC")
const sidebar = document.getElementById("sidebar")

const c = canvas.getContext("2d")
c.imageSmoothingDisabled = true

const fps = 30;

let mouse = {
    offset: { x: 0, y: 0 },
    down: false
}
let coins = 0
let hp = 0
const coinTXT = document.getElementById('coins')
const hpTXT = document.getElementById('hp')
let tileDraw = true

let map = null
let tiles = null
let buildable = []
let enemies = []
let enemyTypes = []
let previewBackgrounds = []
let previewImages = []
let tileSize = 10
const map1 = getFile("maps/water_wall.ftdmap.json")
const bdings = getFile("data/buildings.json")
const enemData = getFile("data/enemies.json")
const previewBGs = [
    getFile("maps/tower_preview_background_1.ftdmap.json"),
    getFile("maps/tower_preview_background_2.ftdmap.json"),
    getFile("maps/tower_preview_background_3.ftdmap.json"),
    getFile("maps/tower_preview_background_4.ftdmap.json"),
    getFile("maps/tower_preview_background_5.ftdmap.json"),
]
updateCoins(50)
updateHp(100)
Promise.all([map1, bdings, enemData, ...previewBGs]).then(([map1, bdings, enemData, ...previewBGs]) => {
    tiles = loadTiles(map1.tiles)
    map = map1
    enemyTypes = enemData
    buildable = bdings
    previewBackgrounds = previewBGs
    update()
    tiles.forEach(tile => {
        tile.update(c, true, enemies)
    })
    const enemyCount = 500
    for (let i = 0; i < enemyCount; i++) {
        enemies.push(new Enemy(enemyTypes[0], map1.enemyPath, tileSize, fps, (e) => enemies.splice(enemies.findIndex(en => en.xPos == e.xPos && en.yPos == e.yPos), 1), updateCoins, updateHp))
    }
    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("mouseout", handleMouseOut)
    canvas.addEventListener("click", handleClick)
    document.getElementById("sidebarCloser").addEventListener("click", closeSideBar)
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
                if (j * tileSize <= e.offsetX && (j + 1) * tileSize >= e.offsetX) {
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
    const prevTileSize = tileSize
    const width = sidebar.classList.contains("open") ? 0.7 : 1
    const step = 0.1
    const scale = 1
    tileSize = Math.floor((window.innerHeight * scale / map.height > window.innerWidth * width * scale / map.width ? window.innerWidth * width * scale / map.width : window.innerHeight * scale / map.height) / step) * step
    if (tileSize != prevTileSize) {
        tileDraw = true
        canvas.style.transform = `scale(${1 / scale})`

        if (window.innerHeight / map.height >= window.innerWidth * width / map.width) {
            canvas.width = window.innerWidth * width * scale
            canvasC.style.width = window.innerWidth * width
            canvas.height = window.innerWidth * width * scale * (map.height / map.width)
            canvasC.style.height = window.innerWidth * width * (map.height / map.width)
        } else {
            canvas.height = window.innerHeight * scale
            canvasC.style.height = window.innerHeight
            canvas.width = window.innerHeight * scale * (map.width / map.height)
            canvasC.style.width = window.innerHeight * (map.width / map.height)
        }
        enemies.forEach(e => {
            e.updateDimensions(tileSize)
        })
        reloadTiles(tiles)
    }
    c.save()
    tiles.forEach((tile) => {
        tile.update(c, tileDraw, enemies)
    })
    enemies.forEach(e => {
        e.update(c)
    })
    tiles.forEach((tile) => {
        tile.updateTower(c, enemies)
    })
    c.restore()
    previewImages.forEach(img => {
        img.draw()
    })
    enemies.forEach(e => e.updated = false)
    setTimeout(() => {
        window.requestAnimationFrame(update);
    }, 1000 / fps);
}


function handleMouseMove(e) {
    tiles.forEach(t => t.hovered = false)
    if (getMouseTile(e) != null) tiles[getMouseTile(e)].hovered = true
}
function handleClick(e) {
    clearSideBar()
    if (getMouseTile(e) == null) return
    if (getMouseTile(e) != tiles.findIndex(t => t.selected == true)) {
        tiles.forEach(t => t.selected = false)
        tiles[getMouseTile(e)].selected = true
    } else {
        tiles.forEach(t => t.selected = false)
    }
    const activeTile = tiles.find(t => t.selected)
    if (!activeTile || !activeTile.building) return
    buildSideBar(activeTile)
}
function handleMouseOut(e) {
    tiles.forEach((tile) => { tile.hovered = false; })
}
function buildSideBar(activeTile) {
    clearSideBar()
    openSideBar()
    let options = buildable.filter(b => b.levels[activeTile.level])
    const currentBuilding = activeTile.tower ? buildable[Number(activeTile.tower.source.img.source.url.split("/")[2][5]) - 1] : null
    if (currentBuilding) {
        options = options.filter(b => b.name == currentBuilding.name)
    }
    if (activeTile.tower) {
        sidebar.innerHTML += `<span class="sidebar-header">Current Tower</span>`
        const level = activeTile.level
        const t = activeTile.tower.source

        const container = document.createElement("div")
        container.classList.add("tower-option-current")
        container.innerHTML = `
        <span class="topt-header"> ${t.name} (Lvl ${level})</span>
            <span class="topt-desc">${t.desc}</span>
            <span class="topt-piercing">${t.shieldPiercing ? '<img src="./img/icons/shield-pierce.svg" title="Tower is Shield Piercing" alt="Shield Piercing" class="topt-pierce-icon">' : ""} ${t.armorPiercing ? '<img src="./img/icons/armor-pierce.svg" title="Tower is Armor Piercing" alt="Armor Piercing" class="topt-pierce-icon">' : ""}</span>
            <div class="topt-stats">
                <span class="topt-stats-header">Stats</span>
                <span class="topt-stat" title="Range"><img src="./img/icons/range.svg" alt="Range: " class="topt-stat-icon">${t.range} tiles</span>
                <span class="topt-stat" title="Reload time"><img src="./img/icons/cooldown.svg" alt="Reload: " class="topt-stat-icon">${t.reload / 1000} s</span>
                <span class="topt-stat" title="Stun time"><img src="./img/icons/stun.svg" alt="Stun: " class="topt-stat-icon">${t.stun ? t.stun / 1000 + " s" : "-"}</span>

            </div>
            <div class="topt-stats-2">
                <span class="topt-stats-header">Damage</span>
                <span class="topt-stat" title="Health damage"><img src="./img/icons/hearts.svg" alt="Heath: " class="topt-stat-icon">${t.damage.health}</span>
                <span class="topt-stat" title="Armor damage"><img src="./img/icons/armor.svg" alt="Armor: " class="topt-stat-icon">${t.damage.armor}</span>
                <span class="topt-stat" title="Shield damage"><img src="./img/icons/shield.svg"  alt="Shield: " class="topt-stat-icon">${t.damage.shield}</span>
            </div>`
        sidebar.appendChild(container)
    }
    sidebar.innerHTML += `<span class="sidebar-header">Available Towers</span>`
    options.forEach(opt => {
        const element = towerOption(opt, activeTile.level)
        sidebar.appendChild(element)

        const background = Math.floor(Math.random() * previewBackgrounds.length)
        const image = new TowerPreview(element.querySelector("canvas"), opt.levels[activeTile.level], previewBackgrounds[background])
        element.querySelector(".topt-build").addEventListener("click", () => {
            const building = new Building(activeTile.x, activeTile.y, opt.levels[activeTile.level], tileSize, fps)
            activeTile.level++
            activeTile.selected = false
            activeTile.tower = building
            activeTile.tower.source.name = opt.name
            clearSideBar()
            buildSideBar(activeTile)
        })
        previewImages.push(image)
    })

}
function clearSideBar() {
    sidebar.innerHTML = ""
    previewImages = []
    closeSideBar()
}
function towerOption(tower, level) {
    const t = tower.levels[level]
    const container = document.createElement("div")
    container.classList.add("tower-option")
    container.innerHTML = `
            <span class="topt-header">${tower.name} (Lvl ${level + 1})</span>
            <span class="topt-desc">${t.desc}</span>
            <canvas class="topt-img"></canvas>
            <span class="topt-cost"> <svg class="topt-price-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path fill="yellow" fill-rule="evenodd"
                    d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.902 7.098a3.75 3.75 0 013.903-.884.75.75 0 10.498-1.415A5.25 5.25 0 008.005 9.75H7.5a.75.75 0 000 1.5h.054a5.281 5.281 0 000 1.5H7.5a.75.75 0 000 1.5h.505a5.25 5.25 0 006.494 2.701.75.75 0 00-.498-1.415 3.75 3.75 0 01-4.252-1.286h3.001a.75.75 0 000-1.5H9.075a3.77 3.77 0 010-1.5h3.675a.75.75 0 000-1.5h-3c.105-.14.221-.274.348-.402z"
                    clip-rule="evenodd" />
                <path fill="none" stroke-width="1.9" stroke="black" stroke-linecap="round" stroke-linejoin="round"
                    d="M14.25 7.756a4.5 4.5 0 100 8.488M7.5 10.5h5.25m-5.25 3h5.25M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>${t.cost}</span>
            <span class="topt-piercing">${t.shieldPiercing ? '<img src="./img/icons/shield-pierce.svg" title="Tower is Shield Piercing" alt="Shield Piercing" class="topt-pierce-icon">' : ""} ${t.armorPiercing ? '<img src="./img/icons/armor-pierce.svg" title="Tower is Armor Piercing" alt="Armor Piercing" class="topt-pierce-icon">' : ""}</span>
            <div class="topt-stats">
                <span class="topt-stats-header">Stats</span>
                <span class="topt-stat" title="Range"><img src="./img/icons/range.svg" alt="Range: " class="topt-stat-icon">${t.range} tiles</span>
                <span class="topt-stat" title="Reload time"><img src="./img/icons/cooldown.svg" alt="Reload: " class="topt-stat-icon">${t.reload / 1000} s</span>
                <span class="topt-stat" title="Stun time"><img src="./img/icons/stun.svg" alt="Stun: " class="topt-stat-icon">${t.stun ? t.stun / 1000 + " s" : "-"}</span>

            </div>
            <div class="topt-stats-2">
                <span class="topt-stats-header">Damage</span>
                <span class="topt-stat" title="Health damage"><img src="./img/icons/hearts.svg" alt="Heath: " class="topt-stat-icon">${t.damage.health}</span>
                <span class="topt-stat" title="Armor damage"><img src="./img/icons/armor.svg" alt="Armor: " class="topt-stat-icon">${t.damage.armor}</span>
                <span class="topt-stat" title="Shield damage"><img src="./img/icons/shield.svg"  alt="Shield: " class="topt-stat-icon">${t.damage.shield}</span>
            </div>
            <button class="topt-build">${level == 0 ? "Build" : "Upgrade"}</button>`

    return container
}
function closeSideBar() {
    if (!sidebar.classList.contains("open")) return
    sidebar.classList.remove("open")
    document.getElementById("sidebarCloser").classList.remove("active")
    tiles.forEach(t => t.selected = false)
}
function openSideBar() {
    if (sidebar.classList.contains("open")) return
    sidebar.classList.add("open")
    document.getElementById("sidebarCloser").classList.add("active")
}
function updateHp(amount) {
    hp += amount
    hpTXT.innerHTML = hp
}
function updateCoins(amount) {
    coins += amount
    coinTXT.innerHTML = coins
}

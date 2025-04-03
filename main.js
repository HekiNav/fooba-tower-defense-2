import Building from "./classes/Building.js"
import Enemy from "./classes/Enemy.js"
import Tile from "./classes/Tile.js"
import TowerPreview from "./classes/Towerpreview.js"
import Waves from "./classes/Wave.js"


const canvas = document.getElementById("canvas")
const canvasC = document.getElementById("canvasC")
const sidebar = document.getElementById("sidebar")

const c = canvas.getContext("2d")
c.imageSmoothingDisabled = true

const fps = 30;

let coins = 0
let hp = 0
const coinTXT = document.getElementById('coins')
const hpTXT = document.getElementById('hp')
let tileDraw = true
let tempListeners = []

let map = null
let tiles = null
let buildable = []
let enemies = []
let waves = null
let enemyTypes = []
let previewBackgrounds = []
let previewImages = []
let tileSize = 10
const map1 = getFile("maps/water_wall.ftdmap.json")
const bdings = getFile("data/buildings.json")
const enemData = getFile("data/enemies.json")
const waveData = getFile("data/waves.json")
const previewBGs = [
    getFile("maps/tower_preview_background_1.ftdmap.json"),
    getFile("maps/tower_preview_background_2.ftdmap.json"),
    getFile("maps/tower_preview_background_3.ftdmap.json"),
    getFile("maps/tower_preview_background_4.ftdmap.json"),
    getFile("maps/tower_preview_background_5.ftdmap.json"),
]
updateCoins(50)
updateHp(100)
Promise.all([map1, bdings, enemData, waveData, ...previewBGs]).then(([map1, bdings, enemData, waveD, ...previewBGs]) => {
    tiles = loadTiles(map1.tiles)
    map = map1
    enemyTypes = enemData
    buildable = bdings
    previewBackgrounds = previewBGs
    waves = new Waves(waveD, enemyTypes, fps)

    waves.onDone(() => {
        alert("YOU WIN")
    })
    waves.onEnemy(e => {
        enemies.push(
            new Enemy(
                e,
                map.enemyPath,
                tileSize,
                fps,
                enemy => {
                    console.log(enemy.ticks, enemies.map(en => en.ticks), enemies.findIndex(en => en.ticks == enemy.ticks))
                    enemies.splice(enemies.findIndex(en => en.ticks == enemy.ticks), 1)
                },
                updateCoins,
                updateHp
            )
        )
    })

    update()
    tiles.forEach(tile => {
        tile.update(c, true, enemies)
    })

    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("mouseout", handleMouseOut)
    canvas.addEventListener("click", handleClick)
    document.getElementById("sidebarCloser").addEventListener("click", closeSideBar)
    addKeyBinds()
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
    const start = performance.now()
    const prevTileSize = tileSize
    const width = sidebar.classList.contains("open") ? 1 : 1
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
        img.update()
    })
    if (waves.done && enemies.length == 0) waves.nextWave()
    if (waves) waves.update()

    enemies.forEach(e => e.updated = false)


    const end = performance.now()
    const currentFps = fpsCounter.tick();

    document.getElementById("fpsCounter").innerText = currentFps + "/" + fps
    if (fps < 60) {
        setTimeout(() => {
            window.requestAnimationFrame(update);
        }, 1000 / fps - (end - start) - 5);
    } else {
        window.requestAnimationFrame(update);
    }

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
function buildSideBar(activeTile, preserveSelected) {
    clearSideBar(preserveSelected)
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
        container.classList.add("tower-option")
        container.innerHTML = `
            <span class="topt-header">${t.name} (Lvl ${level + 1})</span><br>
            <span class="topt-desc">${t.desc}</span>
            <div class="topt-current-container">
            
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
            </div>`
        sidebar.appendChild(container)
    }
    sidebar.innerHTML += `<span class="sidebar-header">Available Towers</span>`
    options.forEach((opt, i) => {
        const element = towerOption(opt, activeTile.level, i)
        sidebar.appendChild(element)

        const background = Math.floor(Math.random() * previewBackgrounds.length)
        const image = new TowerPreview(element.querySelector("canvas"), opt.levels[activeTile.level], previewBackgrounds[background], fps)
        element.querySelector(".topt-build").addEventListener("click", () => {
            const building = new Building(activeTile.x, activeTile.y, opt.levels[activeTile.level], tileSize, fps)
            activeTile.level++
            activeTile.selected = false
            activeTile.tower = building
            activeTile.tower.source.name = opt.name
            clearSideBar()
            buildSideBar(activeTile)
        })
        const listenToKeyDown = (e) => {
            console.log("templistener")
            console.log(i)
            if (e.code != "Digit" + (i + 1)) return
            const building = new Building(activeTile.x, activeTile.y, opt.levels[activeTile.level], tileSize, fps)
            activeTile.level++
            activeTile.tower = building
            activeTile.tower.source.name = opt.name
            clearSideBar(true)
            buildSideBar(activeTile, true)
        };
        tempListeners.push(['keydown', listenToKeyDown])
        window.addEventListener('keydown', listenToKeyDown)
        previewImages.push(image)
    })

}
function clearSideBar(preserveSelected) {
    tempListeners.forEach(l => window.removeEventListener(...l))
    sidebar.innerHTML = ""
    previewImages = []
    closeSideBar(preserveSelected)
}

function towerOption(tower, level, i) {
    const t = tower.levels[level]
    const container = document.createElement("div")
    container.classList.add("tower-option")
    container.innerHTML = `
            <span class="topt-header">${tower.name} (Lvl ${level + 1})</span><br>
            <span class="topt-desc">${t.desc}</span>
            <div class="topt-container">
<div class="topt-img-container"><canvas class="topt-img"></canvas></div>
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
            <button class="topt-build">${level == 0 ? `Build (${i + 1})` : `Upgrade (${i + 1})`}</button>
            </div>`

    return container
}
function closeSideBar(preserveSelected = false) {
    if (!sidebar.classList.contains("open")) return
    sidebar.classList.remove("open")
    document.getElementById("sidebarCloser").classList.remove("active")
    if (!preserveSelected) tiles.forEach(t => t.selected = false)
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
const fpsCounter = {
    sampleSize: 10,
    value: 0,
    _sample_: [],
    _index_: 0,
    _lastTick_: false,
    tick: function () {
        // if is first tick, just set tick timestamp and return
        if (!this._lastTick_) {
            this._lastTick_ = performance.now();
            return 0;
        }
        // calculate necessary values to obtain current tick FPS
        let now = performance.now();
        let delta = (now - this._lastTick_) / 1000;
        let fps = 1 / delta;
        // add to fps samples, current tick fps value 
        this._sample_[this._index_] = Math.round(fps);

        // iterate samples to obtain the average
        let average = 0;
        for (let i = 0; i < this._sample_.length; i++) average += this._sample_[i];

        average = Math.round(average / this._sample_.length);

        // set new FPS
        this.value = average;
        // store current timestamp
        this._lastTick_ = now;
        // increase sample index counter, and reset it
        // to 0 if exceded maximum sampleSize limit
        this._index_++;
        if (this._index_ === this.sampleSize) this._index_ = 0;
        return this.value;
    }
}
function addKeyBinds() {
    const eventWhitelist = [
        "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter",
    ]
    window.addEventListener("keydown", e => {
        console.log(e.code)
        switch (e.code) {
            case "Escape":
                clearSideBar(true)
                break;
            case "Enter":
                tiles.forEach(tile => tile.selected = false)
                const tile = tiles[Math.round(tiles.length / 2 + map.width / 2/*  + i * (!(i % 2) ? 1 : -1) */)]

                tile.selected = true

                break;
            case "ArrowUp":
                let tileI = tiles.findIndex(t => t.selected)
                if (tileI < 0) break
                tiles[tileI].selected = false
                if (tiles[tileI - map.width]) tiles[tileI - map.width].selected = true
                break;
            case "ArrowDown":
                let tileI2 = tiles.findIndex(t => t.selected)
                if (tileI2 < 0) break
                tiles[tileI2].selected = false
                if (tiles[tileI2 - -map.width]) tiles[tileI2 - -map.width].selected = true
                break;
            case "ArrowLeft":
                let tileI3 = tiles.findIndex(t => t.selected)
                if (tileI3 < 0) break
                tiles[tileI3].selected = false
                if (tiles[tileI3 - 1]) tiles[tileI3 - 1].selected = true
                break;
            case "ArrowRight":
                let tileI4 = tiles.findIndex(t => t.selected)
                if (tileI4 < 0) break
                tiles[tileI4].selected = false
                if (tiles[tileI4 + 1]) tiles[tileI4 + 1].selected = true
                break;
            default:
                break;
        }
        if (tiles.some(t => t.selected && t.building) && eventWhitelist.find(ev => ev == e.code)) {
            const activeTile = tiles.find(t => t.selected && t.building)
            buildSideBar(activeTile, true)
        } else if ((e.code == "Escape" || e.code == "KeyE") || !tiles.some(t => t.selected && t.building)) {
            clearSideBar(true)
        }
    })
}
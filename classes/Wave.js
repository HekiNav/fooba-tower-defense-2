export default class Waves {
    constructor(data, enemyData, fps) {
        this.fps = fps
        this.data = data
        this.waves = this.#generateWaves(data, enemyData)
        this.waveIndex = -1
        this.currentWave = null
        this.enemyListeners = []
        this.doneListeners = []
        this.done = false
        this.nextWave()
    }
    onEnemy(fn) {
        this.enemyListeners.push(fn)
    }
    onDone(fn) {
        this.doneListeners.push(fn)
    }
    #generateWaves(data, enemyData) {
        const waves = data.map(w => new Wave(w, enemyData, this.fps))
        return waves
    }
    nextWave() {
        this.done = false
        this.waveIndex++
        this.currentWave = this.waves[this.waveIndex] || null
        if (!this.currentWave) {
            this.doneListeners.forEach(l => l())
            return
        }
        this.currentWave.onEnemy(e => {
            this.enemyListeners.forEach(l => l(e))
        })
        this.currentWave.onDone(() => {
            this.done = true
        })
        this.currentWave.nextPhase()
    }
    update() {
        if (this.currentWave) this.currentWave.update(this.ticks)
    }
    updateFps(fps) {
        this.fps = fps
        this.waves.forEach(w => w.updateFps(fps))
    }
}
class Wave {
    constructor(phases, enemyData, fps) {
        this.fps = fps
        this.phases = phases.map(p => new Phase(p, enemyData, fps))
        this.phaseIndex = -1
        this.currentPhase = this.phases[this.phaseIndex] || null
        this.enemyListeners = []
        this.doneListeners = []
    }
    onEnemy(fn) {
        this.enemyListeners.push(fn)
    }
    onDone(fn) {
        this.doneListeners.push(fn)
    }
    update() {
        if (this.currentPhase) this.currentPhase.update()
    }
    nextPhase() {
        this.phaseIndex++
        this.currentPhase = this.phases[this.phaseIndex] || null
        if (!this.currentPhase) {
            this.doneListeners.forEach(l => l())
            return
        }
        this.currentPhase.onEnemy(e => {
            this.enemyListeners.forEach(l => l(e.enemy))
            if (e.complete) this.nextPhase()
        })

    }
    updateFps(fps) {
        this.fps = fpsthis.
            this.phases.forEach(p => p.updateFps(fps))
    }
}
class Phase {
    constructor(data, enemyData, fps) {
        this.ticks = 0
        this.type = data.type
        this.enemy = enemyData.find(e => e.id == data.id)
        this.interval = Math.floor(data.interval / 1000 * fps)
        this.delay = data.delay
        this.remaining = data.amount
        this.listeners = []
        this.fps = fps
    }
    onEnemy(fn) {
        this.listeners.push(fn)
    }
    update() {
        this.ticks++
        console.log(this.ticks, this.remaining)
        if (this.ticks == this.interval) {
            this.ticks = 0
            this.nextEnemy()
        }
    }
    updateFps(fps) {
        this.fps = fps
        this.interval = data.interval / 1000 * this.fps
    }
    nextEnemy() {
        this.remaining--
        this.listeners.forEach(l => l({ enemy: this.enemy, complete: this.remaining <= 0 }))
    }
}
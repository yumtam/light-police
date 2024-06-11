const probs = {
    12: [40, 0, 0],
    13: [35, 0, 0],
    14: [30, 0, 0],
    15: [30, 0, 2.1],
    16: [30, 67.9, 2.1],
    17: [30, 67.9, 2.1],
    18: [30, 67.2, 2.8],
    19: [30, 67.2, 2.8],
    20: [30, 0, 7],
    21: [30, 63, 7],
    22: [3, 77.6, 19.4],
    23: [2, 68.6, 29.4],
    24: [1, 59.4, 39.6],
}

function getProb(stage, type) {
    const p = probs[stage]
    if (type === 'success') {
        return p[0]
    } else if (type === 'stagedown') {
        return p[1]
    } else if (type === 'destroy') {
        return p[2]
    } else { // failed, but nothing happens
        return (100 - p[0] - p[1] - p[2])
    }
}

let r = 175239

function getRandomNumber() {
    const r_top = Math.floor(r / 1000)
    r = (r * 547) + r_top
    r = (r % 1000000)
    return r
}

function getIsChanceTime(recent) {
    if (recent.length >= 2) {
        const last = recent[0]  
        const before = recent[1]
        if (last.result === "stagedown" && before.result === "stagedown") {
            return true
        }
    }
    return false
}


export function prepareStarforce(context) {

    // Load values and functions from main App context...
    const {stage, recent, setStageDescription, setProbs, setGameState} = context

    setGameState('ready')

    const isChanceTime = getIsChanceTime(recent)
    if (isChanceTime) {
        setStageDescription(`[${stage} -> ${stage+1}] Chance Time!`)
        setProbs([
            '성공 확률: 100%',
            '실패 확률: 0%',
            '파괴 확률: 0%',
        ])
        return
    }

    setStageDescription(`[${stage} -> ${stage+1}] 도전 중...`)
    const success = getProb(stage, 'success')
    const stagedown = getProb(stage, 'stagedown')
    const destroy = getProb(stage, 'destroy')
    const failed = getProb(stage, 'failed')

    if (stagedown > 0) {
        setProbs([
            `성공 확률: ${success}%`,
            `하락 확률: ${stagedown}%`,
            `파괴 확률: ${destroy}%`,
        ])
    } else {
        setProbs([
            `성공 확률: ${success}%`,
            `실패 확률: ${failed}%`,
            `파괴 확률: ${destroy}%`,
        ])
    }
}   


export function runStarforce(context) {
    const {stage, setStage, recent, setRecent, setGameState} = context

    const isChanceTime = getIsChanceTime(recent)

    let success   = getProb(stage, 'success')   * 10
    let stagedown = getProb(stage, 'stagedown') * 10
    let destroy   = getProb(stage, 'destroy')   * 10
    let failed    = getProb(stage, 'failed')    * 10

    if (isChanceTime) {
        success = 1000
        stagedown = 0
        destroy = 0
        failed = 0
    }

    const rand = getRandomNumber() % 1000

    let nextStage = stage
    let result = 'failed'
    if (rand < success) {
        result = 'success'
        nextStage = stage + 1
    } else if (rand < success + stagedown) {
        result = 'stagedown'
        nextStage = stage - 1
    } else if (rand < success + stagedown + destroy) {
        result = 'destroy'
        nextStage = 12
    }

    setRecent([
        {
            stage,
            result,
        },
        ...recent,
    ])
    
    setStage(nextStage)

    if (nextStage === 25) {
        console.log('finished')
        setGameState('finished')
        return
    }

    setGameState('preparing')
}

const sparkles = []

export function splashEffects() {
    // get top center of the item image (id: item-image)
    const itemImage = document.getElementById("item-image")
    const rect = itemImage.getBoundingClientRect()
    const posX = rect.left + rect.width / 2
    const posY = rect.top + rect.height / 8


    for (let i = 0; i < 20; i++) {
        const s = document.createElement("div")
        s.style.position = "absolute"
        s.style.left = `${posX}px`
        s.style.top = `${posY-10}px`
        s.style.height = `5px`
        s.style.width = `5px`
        s.style.background = `hsl(${getRandomNumber() % 360}, 100%, 50%)`
        s.style.borderRadius = `50%`
        s.style.opacity = getRandomNumber() % 10 / 10
        s.style.zIndex = 9999

        document.body.appendChild(s)

        const remainingLifetimeMS = 500
        const velocityX = (getRandomNumber() % 11) - 5
        const velocityY = (getRandomNumber() % 11) - 5
        sparkles.push([
            s,
            remainingLifetimeMS,
            velocityX,
            velocityY,
        ]);
    }
}

setInterval(() => {
    for (let i = 0; i < sparkles.length; i++) {
        const [s, time, vx, vy] = sparkles[i];
        if (time <= 0) {
            document.body.removeChild(s)
            sparkles.splice(i, 1)
            i--
        } else {
            s.style.left = `${parseInt(s.style.left) + vx}px`
            s.style.top = `${parseInt(s.style.top) + vy}px`
            const gravity = 0.5
            sparkles[i] = [s, time-25, vx, vy+gravity]
        }
    }
}, 25);

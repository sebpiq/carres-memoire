const settings = {
    squareCount: 10,
    padding: 10,
    visibleDuration: 2000,
    minSquareSize: 50,
    maxBoardSize: 600,
    durationShowingResults: 1000,
    durationShowingMonkey: 2000,
}

const initialize = () => {
    const board = document.querySelector('main')
    const boardBB = board.getBoundingClientRect()
    const boardWidth = Math.min(boardBB.width, settings.maxBoardSize)
    const boardPaddingX = (boardBB.width - boardWidth) / 2
    const boardHeight = Math.min(boardBB.height, settings.maxBoardSize)
    const boardPaddingY = (boardBB.height - boardHeight) / 2
    const imgContainer = document.querySelector('#img-container')
    const victoryImg = imgContainer.querySelector('#monkey-clapping')
    const defeatImg = imgContainer.querySelector('#monkey-dancing')


    const squareCountInput = document.querySelector('#square-count')
    const visibleDurationInput = document.querySelector('#visible-duration')
    squareCountInput.value = settings.squareCount
    visibleDurationInput.value = settings.visibleDuration

    let divider = 8
    let squareSize = Math.min(boardWidth, boardHeight) / divider
    while (squareSize < settings.minSquareSize) {
        divider += 1
        squareSize = Math.min(boardWidth, boardHeight) / divider
    }
    squareSize = Math.floor(squareSize)

    const xOffset = boardPaddingX + (boardWidth % squareSize) / 2
    const yOffset = boardPaddingY + (boardHeight % squareSize) / 2

    const start = async () => {
        settings.squareCount = parseInt(squareCountInput.value)
        settings.visibleDuration = parseInt(visibleDurationInput.value)
        document.querySelectorAll('.square').forEach(square => square.remove())
        const positions = []

        for (let i = 0; i < settings.squareCount; i++) {
            let x = randomPosition(boardWidth, squareSize)
            let y = randomPosition(boardHeight, squareSize)
            while (positions.find(p => p.x === x && p.y === y)) {
                x = randomPosition(boardWidth, squareSize)
                y = randomPosition(boardHeight, squareSize)
            }
            positions.push({ x, y })
    
            const square = document.createElement('div')
            square.classList.add('square')
            square.style.width = `${squareSize - settings.padding}px`
            square.style.height = `${squareSize - settings.padding}px`
            square.style.left = `${xOffset + x + settings.padding / 2}px`
            square.style.top = `${yOffset + y + settings.padding / 2}px`
            board.appendChild(square)
    
            const number = document.createElement('span')
            number.classList.add('number')
            number.innerText = i + 1
            square.appendChild(number)
        }

        const squares = document.querySelectorAll('.square')
        squares.forEach(square => {
            square.classList.add('visible')
        })
        await timeout(settings.visibleDuration)
        let gameCounter = 1

        const onSquareClick = async (event) => {
            const square = event.target
            const squareNum = parseInt(square.querySelector('.number').innerHTML)
            console.log(square.querySelector('.number').innerText, squareNum, gameCounter)
            if (squareNum === gameCounter) {
                square.classList.add('visible')
                square.classList.add('success')
                gameCounter += 1
                // Victoire
                if (gameCounter > settings.squareCount) {
                    await timeout(settings.durationShowingResults)
                    imgContainer.classList.add('visible')
                    victoryImg.classList.add('visible')
                    await timeout(settings.durationShowingMonkey)
                    imgContainer.classList.remove('visible')
                    victoryImg.classList.remove('visible')
                    start()
                }
            // Défaite
            } else {
                squares.forEach(square => {
                    square.classList.add('visible')
                    square.classList.add('failed')
                })
                await timeout(settings.durationShowingResults)
                imgContainer.classList.add('visible')
                defeatImg.classList.add('visible')
                await timeout(settings.durationShowingMonkey)
                imgContainer.classList.remove('visible')
                defeatImg.classList.remove('visible')
                start()
            }
        }

        squares.forEach(square => {
            square.classList.remove('visible')
            square.onclick = onSquareClick
        })
        
    }

    return { start }
}

const randomPosition = (boardSize, squareSize) => {
    const slotCount = Math.floor(boardSize / squareSize)
    const slot = Math.floor(Math.random() * slotCount)
    return slot * squareSize
}

const timeout = ms => new Promise(resolve => setTimeout(resolve, ms))
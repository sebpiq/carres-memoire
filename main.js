const settings = {
    squareCount: 10,
    padding: 10,
    visibleDuration: 2000,
    minSquareSize: 50,
    maxBoardSize: 600,
    durationShowingResults: 400,
    durationShowingMonkey: 2500,
    windowResizeDebounceDelay: 200,
}

const initialize = () => {
    const board = document.querySelector('main')
    const imgContainer = document.querySelector('#img-container')
    const victoryImg = imgContainer.querySelector('#monkey-clapping')
    const defeatImg = imgContainer.querySelector('#monkey-dancing')
    const squareCountInput = document.querySelector('#square-count')
    const visibleDurationInput = document.querySelector('#visible-duration')

    const start = async () => {
        clearBoard()
        dumpSettings()
        const squares = prepareBoard()

        let gameCounter = 1
        const onSquareClick = function() {
            const square = this
            const squareNum = parseInt(square.querySelector('.number').innerHTML)
            if (squareNum === gameCounter) {
                square.classList.add('visible')
                square.classList.add('success')
                gameCounter += 1
                if (gameCounter > settings.squareCount) {
                    showVictory()
                }
            } else {
                showDefeat()
            }
        }

        squares.forEach(square => {
            square.onclick = onSquareClick
        })

        await _timeout(settings.visibleDuration)

        squares.forEach(square => {
            if (square.classList.contains('success') || square.classList.contains('failed')) {
                return
            }
            square.classList.remove('visible')
        })
        
    }

    const clearBoard = () => {
        document.querySelectorAll('.square').forEach(square => square.remove())
    }

    const prepareBoard = () => {
        const boardBB = board.getBoundingClientRect()
        const boardWidth = Math.min(boardBB.width, settings.maxBoardSize)
        const boardPaddingX = (boardBB.width - boardWidth) / 2
        const boardHeight = Math.min(boardBB.height, settings.maxBoardSize)
        const boardPaddingY = (boardBB.height - boardHeight) / 2
        const positions = []

        let divider = 8
        let squareSize = Math.min(boardWidth, boardHeight) / divider
        while (squareSize < settings.minSquareSize) {
            divider += 1
            squareSize = Math.min(boardWidth, boardHeight) / divider
        }
        squareSize = Math.floor(squareSize)
    
        const xOffset = boardPaddingX + (boardWidth % squareSize) / 2
        const yOffset = boardPaddingY + (boardHeight % squareSize) / 2

        for (let i = 0; i < settings.squareCount; i++) {
            let x = _randomPosition(boardWidth, squareSize)
            let y = _randomPosition(boardHeight, squareSize)
            while (positions.find(p => p.x === x && p.y === y)) {
                x = _randomPosition(boardWidth, squareSize)
                y = _randomPosition(boardHeight, squareSize)
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
        return squares
    }

    const dumpSettings = () => {
        settings.squareCount = parseInt(squareCountInput.value)
        settings.visibleDuration = parseInt(visibleDurationInput.value)
    }

    const loadSettings = () => {
        squareCountInput.value = settings.squareCount
        visibleDurationInput.value = settings.visibleDuration
    }

    const showVictory = async () => {
        imgContainer.classList.add('visible')
        await _timeout(settings.durationShowingResults)
        victoryImg.classList.add('visible')
        await _timeout(settings.durationShowingMonkey)
        imgContainer.classList.remove('visible')
        victoryImg.classList.remove('visible')
        start()
    }

    const showDefeat = async () => {
        const squares = document.querySelectorAll('.square')
        squares.forEach(square => {
            square.classList.add('visible')
            square.classList.add('failed')
        })
        imgContainer.classList.add('visible')
        await _timeout(settings.durationShowingResults)
        defeatImg.classList.add('visible')
        await _timeout(settings.durationShowingMonkey)
        imgContainer.classList.remove('visible')
        defeatImg.classList.remove('visible')
        start()
    }

    const openDialog = () => {
        const dialog = document.querySelector('dialog')
        dialog.showModal()
    }
    
    const closeDialog = () => {
        const dialog = document.querySelector('dialog')
        start()
        dialog.close()
    }

    const onWindowResizeRestart = _debounce(start, settings.windowResizeDebounceDelay)
    const onWindowResize = () => {
        clearBoard()
        onWindowResizeRestart()
    }

    loadSettings()
    window.onresize = onWindowResize

    return { start, openDialog, closeDialog }
}

const _randomPosition = (boardSize, squareSize) => {
    const slotCount = Math.floor(boardSize / squareSize)
    const slot = Math.floor(Math.random() * slotCount)
    return slot * squareSize
}

const _debounce = (fn, delay) => {
    let timeoutId
    return function(...args) {
        console.log('Debounce called')
        if (timeoutId) {
            clearTimeout(timeoutId)
        }
        timeoutId = setTimeout(() => {
            fn.apply(this, args)
        }, delay)
    }
}

const _timeout = ms => new Promise(resolve => setTimeout(resolve, ms))
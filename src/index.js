import Game from './JumpThenFall'

let canvasDom = document.getElementById('main-scene')
let game = new Game(canvasDom)

game.on('gameover', gameoverHandler)


function gameoverHandler(scort) {
    console.log('your scort is ', scort)

}
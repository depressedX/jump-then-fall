import Game from './JumpThenFall/index'

let canvasDom = document.getElementById('main-scene'),
    controlButton = document.getElementById('control')
let game = new Game(canvasDom)

game.on('gameover', gameoverHandler)
controlButton.addEventListener('mousedown',()=>{
    game.charge()
})
controlButton.addEventListener('mouseup',()=>{
    game.release()
})


function gameoverHandler(scort) {
    console.log('your scort is ', scort)

}
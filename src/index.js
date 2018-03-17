import Game from './JumpThenFall/index'
import Vue from 'vue'
import greenPlayIcon from './static/green_play.png'
import greenReplayIcon from './static/green_replay.png'
import './static/digital_number.ttf'


let canvasWrapper = document.querySelector('.canvas-wrapper')
new Vue({
    el: document.querySelector('#canvas-wrapper'),
    mounted() {
        let canvasDom = document.getElementById('main-scene'),
            gameStartButton = document.querySelector('.game-start-button'),
            gameRestartButton = document.querySelector('.game-restart-button')
        this.game = new Game(canvasDom)
        this.game.on('gameover', gameoverHandler)
        gameStartButton.addEventListener('click', () => {
            this.game.restart()
        })
        gameRestartButton.addEventListener('click', () => {
            this.game.restart()
        })

        // 正确绑定touch和click事件
        if (document.ontouchstart !== undefined) {
            canvasDom.addEventListener('touchstart', () => {
                if (this.game.gameState !== this.game.PLAYING) return
                this.game.charge()
            })
            canvasDom.addEventListener('touchend', () => {
                if (this.game.gameState !== this.game.PLAYING) return
                this.game.release()
            })
        }
        else {
            canvasDom.addEventListener('mousedown', () => {
                if (this.game.gameState !== this.game.PLAYING) return
                this.game.charge()
            })
            canvasDom.addEventListener('mouseup', () => {
                if (this.game.gameState !== this.game.PLAYING) return
                this.game.release()
            })
        }


    },
    data() {
        return {
            greenPlaySrc: greenPlayIcon,
            greenReplaySrc: greenReplayIcon,
            game: null,
        }
    }
})

function gameoverHandler(scort) {
    console.log('your scort is ', scort)

}
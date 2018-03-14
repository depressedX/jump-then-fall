import ee from 'event-emitter'


/***
 * 主游戏类
 * 可触发的事件 ongameover
 * @param dom
 * @constructor
 */
function Game(dom) {

    let publicProperties = {
        displayCanvasDom:dom
    }
    Object.assign(this,publicProperties)
}
Game.prototype = {
    constructor: Game,
    restart(){

    }
}
ee(Game.prototype)


export default Game
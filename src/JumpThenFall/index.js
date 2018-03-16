import ee from 'event-emitter'
import BaseLandingBox from './objects/BaseLandingBox'
import * as THREE from 'three'


/***
 * 主游戏类\游戏入口
 * 可触发的事件 ongameover
 * @param dom
 * @constructor
 */
import consts from './consts'
import JumpableObject from './objects/JumpableObject'
import RenderingController from './RenderingController'

function Game(dom, constants = consts) {

    Object.assign(this, {
        consts: consts,

        displayCanvasDom: dom,
        renderingController: null,

        // 被控制的跳跃小人~~~~
        jumpableObject: null,

        landingBoxes: [],

        /****************************************************************/
        /*                       状态变量                          */
        /****************************************************************/
        gameState: 0,
        PLAYING: 0,
        GAMA_OVER: 1,
        // 当前着陆的盒子
        curLandingBoxIndex: 0,
        // 下个盒子的方向
        nextLandingBoxDirection: 0,
        LANDING_BOX_DIRECTION_X: 0,
        LANDING_BOX_DIRECTION_Z: 1,

    })

    // 初始化跳跃小人
    this.jumpableObject = new JumpableObject(constants.JUMPABLE_OBJECT_SIZE)
    this.jumpableObject.position.y = this.consts.ALL_LANDING_BOX_HEIGHT
    this.jumpableObject.on('jumpover', jumpoverHandler.bind(this))


    // 执行一系列初始化
    this.restart()


    // 总渲染控制器
    this.renderingController = new RenderingController(this)
}

Game.prototype = {
    constructor: Game,
    restart() {
        this.gameState = this.PLAYING

        this.jumpableObject.position.x = 0
        this.jumpableObject.position.z = 0

        // 生成初始的盒子
        this.landingBoxes = []
        this.landingBoxes.push(new BaseLandingBox(this.consts.BASE_LANDING_BOX_SIZE, this.consts.ALL_LANDING_BOX_HEIGHT))
        this.curLandingBoxIndex = 0

        // 生成下一个盒子 并做出类似jumpoverHandler的行为
        // 暂时默认着陆盒都是正方形计算边界
        this.generateNextLandingBox()
        let box1Center = this.landingBoxes[this.curLandingBoxIndex].position,
            box2Center = this.landingBoxes[this.curLandingBoxIndex + 1].position,
            jumpableObject = this.jumpableObject

        // 改变小人的朝向 指向下一个盒子的中心点
        let x0 = jumpableObject.position.x,
            z0 = jumpableObject.position.z,
            x1 = box1Center.x,
            z1 = box2Center.z
        this.jumpableObject.orientation = new THREE.Vector2(x1 - x0, z1 - z0)


    },
    // 根据当前站立的盒子生成下一个盒子
    generateNextLandingBox() {
        let curPosX = this.landingBoxes[this.curLandingBoxIndex].position.x,
            curPosZ = this.landingBoxes[this.curLandingBoxIndex].position.z,
            curSize = this.landingBoxes[this.curLandingBoxIndex].size
        let nextLandingBox = new BaseLandingBox(this.consts.BASE_LANDING_BOX_SIZE, this.consts.ALL_LANDING_BOX_HEIGHT)

        // 下一个盒子的方向
        this.nextLandingBoxDirection = Math.random() < .5 ? this.LANDING_BOX_DIRECTION_X : this.LANDING_BOX_DIRECTION_Z
        // 下一个盒子的距离
        let dist = Math.floor(Math.random() * this.consts.JUMPABLE_OBJECT_SIZE * 10 + nextLandingBox.size / 2 + curSize / 2)
        nextLandingBox.position.set(
            curPosX + (this.nextLandingBoxDirection === this.LANDING_BOX_DIRECTION_X ? dist : 0),
            0,
            curPosZ + (this.nextLandingBoxDirection === this.LANDING_BOX_DIRECTION_Z ? dist : 0)
        )


        this.landingBoxes.push(nextLandingBox)
    },

    // 开始蓄力跳
    charge() {
        if (this.gameState !== this.PLAYING) {
            console.log('start game first')
            return
        }
        this.jumpableObject.charge()
    },
    release() {
        this.jumpableObject.release()
    }
}
ee(Game.prototype)

function jumpoverHandler(dx, dz) {
    // 暂时默认着陆盒都是正方形计算边界
    let box1 = this.landingBoxes[this.curLandingBoxIndex],
        box2 = this.landingBoxes[this.curLandingBoxIndex + 1],
        box1Center = box1.position,
        box2Center = box2.position,
        jumpableObject = this.jumpableObject,
        jumpableObjectCenter = jumpableObject.position

    if (jumpableObjectCenter.x - box1Center.x < box1.size / 2 && jumpableObjectCenter.z - box1Center.z < box1.size / 2) {
        // 跳在原来的盒子上  不做动作
    } else if (Math.abs(jumpableObjectCenter.x - box2Center.x) < box2.size / 2 &&
        Math.abs(jumpableObjectCenter.z - box2Center.z) < box2.size / 2) {
        // 跳在下一个盒子上
        this.curLandingBoxIndex++
        this.generateNextLandingBox()
        // 改变小人的朝向 指向下一个盒子的中心点
        let x0 = jumpableObjectCenter.x,
            z0 = jumpableObjectCenter.z,
            x1 = this.landingBoxes[this.curLandingBoxIndex + 1].position.x,
            z1 = this.landingBoxes[this.curLandingBoxIndex + 1].position.z
        this.jumpableObject.orientation = new THREE.Vector2(x1 - x0, z1 - z0)
    } else {
        // 暂时把curLandingBoxIndex看做分数
        this.emit('gameover', this.curLandingBoxIndex)
        this.state = this.GAMA_OVER

        setTimeout(() => {
            this.restart()
        }, 1000)
    }


}

export default Game
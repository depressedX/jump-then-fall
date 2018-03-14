import * as THREE from 'three'
import FPS from '../utils/FPSController'
import ee from 'event-emitter'


/***
 * 弹跳过程模拟器,
 * x,y  朝向x轴正方向垂直于y跳跃
 * @constructor
 */
function BouncingSimulator() {
    let publicProperties = {
        // 已走的步数
        stepsTaken: 0,
        x: 0,
        y: 0,
        targetDist: 0,
        maxHeight: 0,
        totalSteps: 0,
        isEnd: false
    }
    Object.assign(this, publicProperties)
}

BouncingSimulator.prototype = {
    constructor: BouncingSimulator,
    /***
     * 重置到起点  开始模拟整个过程
     * @param maxHeight 弹跳过程中最大高度
     * @param targetDist 目标距离
     * @param steps 一共移动步数
     */
    reset(maxHeight, targetDist, steps) {
        this.x = this.y = this.stepsTaken = 0
        this.targetDist = targetDist
        this.maxHeight = maxHeight
        this.totalSteps = steps
        this.isEnd = false
    },

    /***
     * 前进一步
     * @returns {{dx: number, dy: number}}
     */
    next() {
        if (this.stepsTaken >= this.totalSteps) {
            this.isEnd = true
            return {
                dx: 0,
                dy: 0
            }
        }
        this.stepsTaken++
        let preX = this.x,
            preY = this.y
        let stepRate = this.stepsTaken / this.totalSteps
        this.x = stepRate * this.targetDist
        this.y = 4 * this.maxHeight * (stepRate - stepRate * stepRate)
        return {
            dx: this.x - preX,
            dy: this.y - preY
        }
    }
}

/***
 * 可跳跃的物体，能够蓄力弹跳
 * 会触发的事件 onjumpover(dx,dz)
 * @constructor
 */
function JumpableObject(size) {
    let publicProperties = {
        /****************************************************************/
        /*                       info                          */
        /****************************************************************/
        size: null,
        // 默认弹跳下落到与原来Y相同则停止
        initialY: 0,
        // 弹跳高度与size成正比
        get maxHeight() {
            return this.size * 2
        },


        /****************************************************************/
        /*                       状态量                          */
        /****************************************************************/
        state: null,
        bouncingDuration: 0,
        orientation: new THREE.Vector2(1,  1),
        get position() {
            return this.object3D.position
        },


        /****************************************************************/
        /*                       常量                          */
        /****************************************************************/
        IDLE: 0,
        CHARGING: 1,//蓄力中
        BOUNCING: 2,//在空中


        /****************************************************************/
        /*                       私有工具属性                          */
        /****************************************************************/
        bouncingSimulator: new BouncingSimulator()

    }
    Object.assign(this, publicProperties)

    this.object3D = new JumpableObject3D(size)
    this.state = this.IDLE

    // 委托给FPS管理器的更新函数
    FPS.delegate(this.update.bind(this))
}

// 绑定事件触发器
ee(JumpableObject.prototype)
// 绑定原型函数
JumpableObject.prototype = {
    constructor: JumpableObject,

    charge() {
        this.state = this.CHARGING
    },
    release() {
        this.state = this.BOUNCE_ROARING

        this.bouncingDuration = 0
    },

    update() {
        switch (this.state) {
            case this.IDLE: {
                break
            }
            case this.CHARGING: {
                this.bouncingDuration++
                break
            }
            case this.BOUNCING: {
                let {dx, dy} = this.bouncingSimulator.next()
                this.height = this.height + dy
                this.position.x += dx*Math.cos(this.orientation.angle())
                this.position.z += dx*Math.sin(this.orientation.angle())

                if (this.bouncingSimulator.isEnd){
                    this.state = this.IDLE
                    this.bouncingDuration = 0
                }
                break
            }
        }
    },


}

function JumpableObject3D(size) {
    let geometry = new THREE.SphereGeometry(size, size * 5, size * 5);
    var material = new THREE.MeshBasicMaterial({color: 0xffff00});

    THREE.Mesh.call(this, geometry, material)
}

JumpableObject3D.prototype = Object.assign(Object.create(THREE.Mesh.prototype), {
    constructor: JumpableObject3D,
})
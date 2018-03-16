import * as THREE from 'three'
import FPS from '../../utils/FPSController'
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
        size,

        // 默认弹跳下落到与原来Y相同则停止
        initialY: 0,
        // 弹跳高度与size成正比
        maxHeight: 0,
        // 最大弹跳距离与size成正比
        maxBouncingDist: 0,


        /****************************************************************/
        /*                       状态量                          */
        /****************************************************************/
        state: null,
        bouncingDuration: 0,
        orientation: new THREE.Vector2(1, 1),
        position: null,


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
    Object.defineProperty(this, 'position', {
        enumerable: true,
        get() {
            if (!this.object3D) return null
            return this.object3D.position
        }
    })
    Object.defineProperty(this, 'maxHeight', {
        enumerable: true,
        get() {
            return this.size * 2
        }
    })
    Object.defineProperty(this, 'maxBouncingDist', {
        enumerable: true,
        get() {
            return this.size * 50
        }
    })


    this.object3D = new JumpableObject3D(size)
    this.state = this.IDLE

    // 委托给FPS管理器的更新函数
    FPS.delegate(this.update.bind(this))

}

// 绑定原型函数
JumpableObject.prototype = {
    constructor: JumpableObject,

    charge() {
        if (!this.state === this.IDLE) return
        this.state = this.CHARGING
    },
    release() {
        if (!this.state === this.CHARGING) return
        this.state = this.BOUNCING
        let dist = Math.min(this.bouncingDuration * 2.5, this.maxBouncingDist)
        this.bouncingSimulator.reset(this.maxHeight, dist, 20)
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
                this.position.x += dx * Math.cos(this.orientation.angle())
                this.position.z += dx * Math.sin(this.orientation.angle())
                this.position.y += dy

                if (this.bouncingSimulator.isEnd) {
                    this.state = this.IDLE
                    this.bouncingDuration = 0
                    this.emit('jumpover', this.bouncingSimulator.x, this.bouncingSimulator.y)
                }
                break
            }
        }
    },


}
// 绑定事件触发器
ee(JumpableObject.prototype)


/***
 * 可添加到场景中的小人  初始位置为脚站在原点
 * @param size  圆柱体下底面直径
 * @constructor
 */
function JumpableObject3D(size) {
    let height = size * 1.7

    let randomColor = new THREE.Color().setHSL(Math.random(), .5, .5)

    let bodyGeometry = new THREE.CylinderGeometry(size / 2 * .7, size / 2, height, size, height * 5),
        bodyMaterial = new THREE.MeshLambertMaterial({
            color: randomColor
        })
    let body = new THREE.Mesh(bodyGeometry, bodyMaterial)

    let headGeometry = new THREE.SphereGeometry(size / 2 * .7),
        headMaterial = new THREE.MeshLambertMaterial({
            color: randomColor
        })
    let head = new THREE.Mesh(headGeometry, headMaterial)

    body.position.y = height / 2
    head.position.set(0, height + size/2 , 0)



    THREE.Group.call(this)
    this.add(body, head)
}

JumpableObject3D.prototype = Object.assign(Object.create(THREE.Group.prototype), {
    constructor: JumpableObject3D,
})


export default JumpableObject
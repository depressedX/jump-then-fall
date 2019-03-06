import * as THREE from 'three'
import FPS from '../../utils/FPSController'
import ee from 'event-emitter'


/***
 * 弹跳过程模拟器,
 * x,y  朝向x轴正方向垂直于y跳跃
 * @constructor
 */
class BouncingSimulator {
    stepsTaken = 0
    x = 0
    y = 0
    targetDist = 0
    maxHeight = 0
    totalSteps = 0
    isEnd = false

    constructor() {
    }

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
    }

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

enum state {
    IDLE = 0,
    CHARGING = 1,//蓄力中
    BOUNCING = 2,//在空中
}


/***
 * 可跳跃的物体，能够蓄力弹跳
 * 会触发的事件 onjumpover(dx,dz)
 * @constructor
 */
class JumpableObject{
    /****************************************************************/
    /*                       info                          */
    /****************************************************************/
    size = 0
    // 默认弹跳下落到与原来Y相同则停止
    initialY = 0
    // 弹跳高度与size成正比
    get maxHeight() {
        return this.size * 2
    }
    // 最大弹跳距离与size成正比
    maxBouncingDuration = 125


    /****************************************************************/
    /*                       状态量                          */
    /****************************************************************/
    state = state.IDLE
    bouncingDuration = 0
    orientation = new THREE.Vector2(1, 1)

    /****************************************************************/
    /*                       常量                          */
    /****************************************************************/


    /****************************************************************/
    /*                       私有工具属性                          */
    /****************************************************************/
    bouncingSimulator = new BouncingSimulator()


    /****************************************************************/
    /*                       其他                          */
    /****************************************************************/
    object3D: JumpableObject3D
    
    
    // todo 这里还不确定对不对
    height = 0

    get position() {
        if (!this.object3D) throw new Error('object3D is null')
        return this.object3D.position
    }
    
    constructor(size) {

        this.size = size

        Object.defineProperties(this, {
        })


        this.object3D = new JumpableObject3D(size)
        this.state = state.IDLE

// 委托给FPS管理器的更新函数
        FPS.delegate(this.update.bind(this))
    }

    charge() {
        if (this.state !== state.IDLE) return
        this.state = state.CHARGING
        this.object3D.press(120)
    }

    release() {
        if (!(this.state === state.CHARGING)) return
        this.state = state.BOUNCING
        this.object3D.release(120)
        let dist = Math.min(this.bouncingDuration, this.maxBouncingDuration) * 2.5
        
        this.bouncingSimulator.reset(this.maxHeight, dist, 20)
        this.bouncingDuration = 0
    }

    update() {
        switch (this.state) {
            case state.IDLE: {
                break
            }
            case state.CHARGING: {
                this.bouncingDuration++
                break
            }
            case state.BOUNCING: {
                let {dx, dy} = this.bouncingSimulator.next()
                this.height = this.height + dy
                this.position.x += dx * Math.cos(this.orientation.angle())
                this.position.z += dx * Math.sin(this.orientation.angle())
                this.position.y += dy

                if (this.bouncingSimulator.isEnd) {
                    this.state = state.IDLE
                    this.bouncingDuration = 0
                    this.emit('jumpover', this.bouncingSimulator.x, this.bouncingSimulator.y)
                }
                break
            }
        }
        this.object3D.update()
    }
}

// 绑定事件触发器
ee(JumpableObject.prototype)
interface JumpableObject extends EventEmitter{
    
}


/***
 * 可添加到场景中的小人  初始位置为脚站在原点
 * @param size  圆柱体下底面直径
 * @constructor
 */
class JumpableObject3D extends THREE.Group {
    radiusTop:number
    radiusBottom:number
    height:number
    radiusSegments:number
    heightSegments:number
    
    bones:THREE.Bone[]
    head:THREE.Object3D
    body:THREE.Object3D

    // 形变相关
    PRESS = 0
    RELEASE = 1
    morphType:number|null
    morphFactor = 0
    constructor(size) {
        super()
        this.radiusTop = size / 2 * .7
        this.radiusBottom = size / 2
        this.height = size * 1.7
        this.radiusSegments = size
        this.heightSegments = size * 8

        // 颜色
        let randomColor = new THREE.Color().setHSL(Math.random(), .5, .5)

        // 身体 上底半径小的圆柱体
        // 身体几何体
        let bodyGeometry = new THREE.CylinderGeometry(this.radiusTop, 
            this.radiusBottom, this.height, this.radiusSegments, this.heightSegments)
        // 身体的骨骼
        let bones:THREE.Bone[] = [],
            bone0 = new THREE.Bone(),
            bone1 = new THREE.Bone(),
            bone2 = new THREE.Bone()
        bone0.position.y = -this.height / 2
        bone1.position.y = 0
        bone2.position.y = this.height / 2
        bone0.add(bone1)
        bone1.add(bone2)
        bones.push(bone0, bone1, bone2)
        let skeleton = new THREE.Skeleton(bones);

        // 修改顶点的skinIndices/skinWeights
        for (var heightSegment = this.heightSegments; heightSegment >= 0; heightSegment--) {
            let index = heightSegment > this.heightSegments / 2 ? 1 : 0
            let segmentHeight = this.height / this.heightSegments
            let offset = (heightSegment * segmentHeight - bones[index].position.y - this.height / 2) / (this.height / 2)
            for (let i = 0; i < this.radiusSegments; i++) {
                bodyGeometry.skinIndices.push(new THREE.Vector4(index, index + 1, 0, 0))
                bodyGeometry.skinWeights.push(new THREE.Vector4(1 - offset, offset, 0, 0))
            }
        }
        bodyGeometry.skinIndices.push(new THREE.Vector4(1, 2, 0, 0))
        bodyGeometry.skinWeights.push(new THREE.Vector4(0, 1, 0, 0))
        bodyGeometry.skinIndices.push(new THREE.Vector4(0, 1, 0, 0))
        bodyGeometry.skinWeights.push(new THREE.Vector4(1, 0, 0, 0))

        let bodyMaterial = new THREE.MeshLambertMaterial({
            color: randomColor,
            skinning: true
        })
        let body = new THREE.SkinnedMesh(bodyGeometry, bodyMaterial)
        // 绑定骨架
        body.add(bones[0])
        body.bind(skeleton)
        this.bones = bones

        // 头  就是一个球体
        let headGeometry = new THREE.SphereGeometry(this.radiusTop),
            headMaterial = new THREE.MeshLambertMaterial({
                color: randomColor
            })
        let head = new THREE.Mesh(headGeometry, headMaterial)


        body.position.y = this.height / 2
        head.position.set(0, this.height + size / 2, 0)

        this.body = body
        this.head = head
        super.add(body, head)


    }

    update() {
        switch (this.morphType) {
            case this.PRESS: {
                let c = this.morphFactor
                this.head.position.y -= 2 * c
                this.bones[2].position.y -= c
                this.bones[1].position.y -= c
                this.bones[1].scale.x += c / 10
                this.bones[1].scale.z += c / 10
                this.bones[2].scale.x += c / 50
                this.bones[2].scale.z += c / 50
                if (this.bones[2].position.y < 0) {
                    this.morphType = null
                }
                break
            }
            case this.RELEASE: {
                let c = this.morphFactor
                this.head.position.y += 2 * c
                this.bones[2].position.y += c
                this.bones[1].position.y += c
                this.bones[1].scale.x -= c / 10
                this.bones[1].scale.z -= c / 10
                this.bones[2].scale.x -= c / 50
                this.bones[2].scale.z -= c / 50
                if (this.bones[2].position.y > this.height / 2) {
                    this.morphType = null
                }
                break
            }
        }
    }

    press(duration) {
        this.morphFactor = this.height / 2 / duration
        this.morphType = this.PRESS
    }

    release(duration) {
        this.morphFactor = this.height / 2 / duration
        this.morphType = this.RELEASE
    }
}


export default JumpableObject
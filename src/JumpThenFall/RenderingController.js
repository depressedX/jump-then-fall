/***
 * 负责利用传递过来的上下文中的信息，正确的渲染各物体、包括相机的位置场景的构成
 */
import * as THREE from 'three'
import defaultConfig from './consts'
import OrbitControls from '../libs/OrbitControls'
import FPSController from "../utils/FPSController";

function RenderingController(context, config = defaultConfig) {
    this.context = context
    this.config = config

    // 场景
    this.scene = new THREE.Scene()
    this.scene.add(context.jumpableObject.object3D)
    this.scene.add.apply(this.scene, context.landingBoxes.map(v => v.object3D))
    this.scene.add(new THREE.AxesHelper(100))

    // 监控着陆盒数组的改变 以及时地对scene做出改变 以正确的渲染
    watchLandingBoxArray.call(this, context, 'landingBoxes')

    // 相机
    let left = -config.CAMERA_HORIZONAL_SIZE / 2,
        top = config.CAMERA_HORIZONAL_SIZE * config.CAMERA_DEFAULT_ASPECT_RATIO / 2
    this.camera = new THREE.OrthographicCamera(left, -left, top, -top, 0.1, 5000)

    // 仿射变换到正确姿势
    this.camera.position.x =-300
    this.camera.position.z =-300
    this.camera.position.y = context.consts.JUMPABLE_OBJECT_SIZE * 20
    this.camera.lookAt(new THREE.Vector3(0, 0, 0))
    this.camera.position.x +=70
    this.camera.position.z +=70
    this.cameraOffsetX = -230
    this.cameraOffsetZ = -230


    // 平行光
    this.followingDirectionLight = new THREE.DirectionalLight()
    this.followingDirectionLight.position.set(-2, -2, 5)
    this.scene.add(this.followingDirectionLight)

    // 环境光
    this.ambientLight = new THREE.AmbientLight()
    this.scene.add(this.ambientLight)

    // 渲染器
    this.renderer = new THREE.WebGLRenderer({
        canvas: context.displayCanvasDom,
        antialias: true
    })
    this.renderer.setSize(config.RENDERER_DEFAULT_RESOLUTION, config.RENDERER_DEFAULT_RESOLUTION * config.CAMERA_DEFAULT_ASPECT_RATIO)
    this.renderer.setClearColor(0xffd998)
    FPSController.delegate(this.check.bind(this))

    this.cameraPositionLeftX = 0
    this.cameraPositionLeftZ = 0
    this.cameraDeltaDist = config.JUMPABLE_OBJECT_SIZE / 3

}

RenderingController.prototype = {
    constructor: RenderingController,
    check() {
        if (!this.context) return

        let context = this.context
        let x0 = context.landingBoxes[context.curLandingBoxIndex].position.x,
            z0 = context.landingBoxes[context.curLandingBoxIndex].position.z,
            x1 = context.landingBoxes[context.curLandingBoxIndex + 1].position.x,
            z1 = context.landingBoxes[context.curLandingBoxIndex + 1].position.z


        this.cameraPositionLeftX = this.cameraOffsetX + (x0 + x1) / 2 - this.camera.position.x
        this.cameraPositionLeftZ = this.cameraOffsetZ + (z0 + z1) / 2 - this.camera.position.z


        // 处理剩下的需要移动的相机XZ
        let l = Math.sqrt(this.cameraPositionLeftX * this.cameraPositionLeftX + this.cameraPositionLeftZ * this.cameraPositionLeftZ)
        let dx, dz
        if (l > this.cameraDeltaDist) {
            dx = this.cameraDeltaDist * this.cameraPositionLeftX / l
            dz = this.cameraDeltaDist * this.cameraPositionLeftZ / l
        } else if (l !== 0) {
            dx = this.cameraPositionLeftX
            dz = this.cameraPositionLeftZ
        } else {
            dx = 0
            dz = 0
        }
        this.camera.position.x += dx
        this.camera.position.z += dz


        this.renderer.render(this.scene, this.camera)
    },
    resetCameraPosition(){
        this.camera.position.x = this.cameraOffsetX
        this.camera.position.z = this.cameraOffsetZ
    }
}

function watchLandingBoxArray(object, property) {
    let that = this
    let reDefinedProperties = {
        push: {
            value: function (...x) {
                that.scene.add.apply(that.scene, x.map(v => v.object3D))
                Array.prototype.push.apply(this, x)
            },
            configurable: true,
            writable: false,
            enumerable: false
        }
    }
    object['_' + property] = object[property]
    Object.defineProperty(object, property, {
        set(v) {
            let _v = this['_' + property]
            // 如果赋值的不是数组 返回
            if (!v instanceof Array) {
                console.log('must assign an Array')
                return
            }
            // remove掉新数组不包含的元素
            _v.forEach(element => {
                if (!v.includes(element)) {
                    that.scene.remove(element.object3D)
                }
            })
            // add新数组的元素
            if (v.length > 0) {
                that.scene.add.apply(that.scene, v.map(vv => vv.object3D))
            }
            this['_' + property] = v
            Object.defineProperties(this['_' + property], reDefinedProperties)
        },
        get() {
            return this['_' + property]
        }
    })


    Object.defineProperties(object['_' + property], reDefinedProperties)


}

export default RenderingController
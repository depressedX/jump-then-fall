import * as THREE from 'three'
/***
 * 所有着陆盒的共同点是 具有相同的高度，有一个中心点和一个可着陆区域形状
 * BaseLandingBox 是所有着陆盒的父类
 * @param size 可着陆区域外接正方形的尺寸
 * @param height 高度
 * @constructor
 */
class BaseLandingBox {
    constructor(size, height) {
        this.size = size
        Object.defineProperty(this, 'position', {
            get() {
                return this.object3D.position
            }
        })
        this.object3D = new BaseLandingBox3D(size, height)
    }
}

class BaseLandingBox3D extends THREE.Mesh {
    constructor(size, height) {
        let geometry = new THREE.BoxGeometry(size, height, size),
            material = new THREE.MeshLambertMaterial({
                color: new THREE.Color().setHSL(Math.random(), .5, .5)
            })
        geometry.translate(0, height / 2, 0)
        super(geometry, material)
    }
}

export default BaseLandingBox
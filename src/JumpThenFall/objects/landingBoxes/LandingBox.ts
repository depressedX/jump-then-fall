import * as THREE from 'three'
export interface LandingBox {
    size:number,
    object3D:THREE.Object3D,
    position:THREE.Vector3
}
/***
 * 所有着陆盒的共同点是 具有相同的高度，有一个中心点和一个可着陆区域形状
 * BaseLandingBox 是所有着陆盒的父类
 * @param size 可着陆区域外接正方形的尺寸
 * @param height 高度
 * @constructor
 */
export class BaseLandingBox implements LandingBox{
    size:number
    object3D:BaseLandingBox3D
    get position():THREE.Vector3 {
        return this.object3D.position
    }
    constructor(size, height) {
        this.size = size
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

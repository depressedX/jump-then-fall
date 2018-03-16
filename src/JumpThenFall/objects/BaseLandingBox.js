import * as THREE from 'three'




/***
 * 所有着陆盒的共同点是 具有相同的高度，有一个中心点和一个可着陆区域形状
 * BaseLandingBox 是所有着陆盒的父类
 * @param size 可着陆区域外接正方形的尺寸
 * @param height 高度
 * @constructor
 */
function BaseLandingBox(size, height) {

    Object.assign(this,{
        size,
    })
    Object.defineProperties(this,{
        position:{
            get(){
                return this.object3D.position
            }
        }
    })

    this.object3D = new BaseLandingBox3D(size,height)

}

function BaseLandingBox3D(size, height) {
    let geometry = new THREE.BoxGeometry(size,height,size),
        material = new THREE.MeshLambertMaterial({
            color:new THREE.Color().setHSL(Math.random(),.5,.5),
            // wireframe:true
        })
    geometry.translate(0,height/2,0)
    THREE.Mesh.call(this,geometry,material)
}

BaseLandingBox3D.prototype = Object.assign(Object.create(THREE.Mesh.prototype), {
    constructor: BaseLandingBox3D,

})

export default BaseLandingBox
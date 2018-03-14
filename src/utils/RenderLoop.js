/***
 * 负责利用传递过来的上下文中的信息，正确的渲染各物体、包括相机的位置场景的构成
 */
import FPS from './FPSController'

let context = null

function init(c) {
    context = c
    FPS.delegate(check)
}

function check() {
    if (!context) return

}
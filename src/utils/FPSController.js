let monitor = requestAnimationFrame(funcExecutor)
let funcList = []

function funcExecutor() {
    funcList.forEach(func=>{
        func()
    })
}

function delegate(...funcs) {
    funcList.push.apply(funcList,funcs)
}

export default {
    delegate,
}
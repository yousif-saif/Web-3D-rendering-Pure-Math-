game.width = 600
game.height = 600
ctx = game.getContext("2d")
w = game.width
h = game.height

const COLOR = "green"
const BACKGROUND = "black"
const SIZE = 5
const LIGHT_POINT = {x: 0, y: 0, z: 1}

function clear() {
    ctx.fillStyle = BACKGROUND
    ctx.fillRect(0, 0, w, h)
}


function point({x, y}, color=COLOR, size=SIZE) {
    ctx.fillStyle = color
    const halfSize = size/2
    ctx.fillRect(x-halfSize, y-halfSize, size, size)

    return {x, y}
}


function line(p1, p2) {
    // console.log(x1)
    ctx.lineWidth = 3
    ctx.strokeStyle = COLOR
    ctx.beginPath()
    ctx.moveTo(p1.x, p1.y)
    ctx.lineTo(p2.x, p2.y)
    ctx.stroke()

}


function calcDist2D({x1, y1}, {x2, y2}) {
    return Math.sqrt(
        Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2)
    )

}


function colorSide(p1, p2) {
    ctx.fillStyle = COLOR
    fillSize = calcDist2D({x1: p1.x, y1: p1.y}, {x2: p2.x, y2: p2.y})
    ctx.fillRect(p1.x, p1.y, fillSize, fillSize)
}

function screen({x, y}) {
    // -1..1  => 0..2 => 0..1 => 0..w 
    // -1..1 => 0..2 => 0..1 => 0..h

    x = (x + 1) / 2 * w
    y = (y*-1 + 1) / 2  * h // changed

    return {x, y}
}

function webScreen({x, y}) {
    // 0..w => 0..1 => 0..2 => -1..1
    // 0..h => 0..1 => 

    x = (x / w * 2 - 1)
    y = (y / h * 2 - 1)*-1

    return {x: +x.toFixed(2), y: +y.toFixed(2)}
    
}


function project({x, y, z}) {
    return {
        x: x / z,
        y: y / z
    }
}

clear()

function calcDist3D(p1, p2) {
    return Math.sqrt(
        Math.pow(p2.x-p1.x, 2) + Math.pow(p2.y-p1.y, 2) + Math.pow(p2.z-p1.z, 2)
    )
    
}


class Square {
    constructor({x, y}, l) {
        this.x = x
        this.y = y
        this.l = l
    }


    getEdges() {
        // returns the four edges of the square
        return [
            {x: this.x, y: this.y},
            {x: -this.x, y: this.y},
            {x: -this.x, y: -this.y},
            {x: this.x, y: -this.y},

        ]
    }

    diagonalEdge() {
        return [
            {x: this.x, y: this.y},
            {x: this.x, y: -this.y}
        ]
    }

    diagonalLength() {
        return calcDist2D({ x1: this.x, y1: this.y }, { x2: this.x+this.l, y2: this.y+this.l })
    }

    area() {
        return this.l * this.l
    }


}


class Cube {
    constructor({x, y, z}, l) {
        this.x = x
        this.y = y
        this.z = z
        this.l = l
        this.face = new Square({x, y}, l)
    }

    getEdges() {
        const edges = [
            {x: -this.x, y: this.y, z: this.z},
            {x: this.x, y: this.y, z: this.z},
            {x: this.x, y: -this.y, z: this.z},
            {x: -this.x, y: -this.y, z: this.z},
            
            {x: -this.x, y: this.y, z: -this.z},
            {x: this.x, y: this.y, z: -this.z},
            {x: this.x, y: -this.y, z: -this.z},
            {x: -this.x, y: -this.y, z: -this.z},

        ]

        return edges

    }

    render(step, dz, theta, beta) {
        const fillarPoints = []
        const edges = this.getEdges()
        const half = this.l

        for (let u = -half; u <= half; u += step) {
            for (let v = -half; v <= half; v += step) {
                const p3d = {
                    x: edges[0].x + u + half,
                    y: edges[0].y + v - half,
                    z: edges[0].z                    
                }
                
                
                for (let pi of [Math.PI/2, -Math.PI/2]) {                    
                    const sideX = rotate_x({x: p3d.x, y: p3d.y, z: p3d.z}, pi)
                    // const tz = translateZ(rotate_y(sideX, theta), dz)
                    const tz = translateZ(rotate_x(rotate_y(sideX, theta), beta), dz)
                    const sp = screenPoint(tz)
                    if (Math.abs(tz.z) < 0.7) {
                        point(sp, `color-mix(in oklab, ${COLOR} 10%, white 50%)`)
                        // point(sp, "RED")

                    } else {
                        point(sp)
                    }
                    
                }


                for (let angle=0; angle < Math.PI*2; angle+=Math.PI/2) {
                    const side = rotate_y(p3d, angle)
                    
                    // const tz = translateZ(rotate_y(side, theta), dz)
                    const tz = translateZ(rotate_x(rotate_y(side, theta), beta), dz)

                    const sp = screenPoint(tz)

                    if (Math.abs(tz.z) < 0.7) {
                        point(sp, `color-mix(in oklab, ${COLOR} 10%, white 50%)`)
                        // point(sp, "RED")

                    } else {
                        point(sp)
                    }
                    

                    // its not correct but it makes a cool animation
                    // if (cross > 0) {
                        // point(screenPoint(translateZ(rotate_y(side, theta), dz)), COLOR)
                        
                    // } else {
                    //     point(screenPoint(translateZ(rotate_y(side, theta), dz)), "RED")

                    // }
                        

                }
            }
        }

        return fillarPoints
    }

}


function translateZ({x, y, z}, dz) {
    return {
        x, y, z: z + dz
    }
}


function rotate_y({x, y, z}, angle) {
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)

    // Rotate around the viewer
    return {
        x: x * cos + z * sin,
        y: y,
        z: z * cos - x * sin,
    }

    // return {
    //     x: x * cos - z * sin,
    //     y: x * sin + z * cos,
    //     z: z
    // }


}

function rotate_x({x, y, z}, angle) {
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)

    return {
        x: x,
        y: y * cos - z * sin,
        z: y * sin + z * cos
    }
}


function rotate_z({x, y, z}, angle) {
    const sin = Math.sin(angle)
    const cos = Math.cos(angle)

    return {
        x: x * cos - y * sin,
        y: x * sin + y * cos,
        z: z
    }

}

function screenPoint({x, y, z}) {
    return screen(project({x, y, z}))
}

function plot3D({x, y, z}) {
    point(screenPoint({x, y, z}))
    return screen
}


const FPS = 60
dz = 1
theta = 0
beta = 0

const cube = new Cube({x: 0.4, y: 0.4, z: 0.4}, 0.4)
let edges = cube.getEdges()

function frame() {
    dt = 1/FPS
    // dz += 1 * dt
    theta += Math.PI / 2 * dt
    beta += Math.PI / 2 * dt
    clear()
    // point(screenPoint(LIGHT_POINT), COLOR, 20)
    cube.render(0.07, dz, theta, beta)



    setTimeout(frame, 1000/FPS)

}

setTimeout(frame, 1000/FPS)



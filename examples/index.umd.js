var gm = new GLManager("canvas", { fixRetina: false })

let gl = gm.gl

const vertexShader = `
    attribute vec2 a_pos;
    void main() {
        gl_Position = vec4(a_pos, 0.0, 1.0);
        gl_PointSize = 10.0;
    }
`

const fragShader = `
    void main() {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    }
`
gm.adjustViewport()

var program = gm.createProgram(vertexShader, fragShader)

gl.useProgram(program.program)

let buffer = gm.createBuffer(new Float32Array([-0.5, -0.5, 0.5, 0.5]))

gm.bindAttribute(buffer, program.a_pos, 2)

gl.drawArrays(gl.POINTS, 0, 2)

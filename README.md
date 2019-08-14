## Intro

> 🎃 A wrapped, elegant webGL library.

## Installation

### CDN

```
<script src="https://unpkg.com/wrap-gl"></script>
```

### npm

```
npm i wrap-gl
```

## Usage

### 1. new a glManager Object

#### CDN

```
var glManager/gm = new GLManager()
```

#### npm

```
import GLManager/GM from "wrap-gl"

var glManager/gm = new GLManager()
```

### 2. usage

```
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
```

> And you'll get this =>

![](http://ww2.sinaimg.cn/large/006tNc79ly1g5z9q4kgxij30xa0i0q35.jpg)

### 3. have fun!

## API(GLManager)

### 1. props

#### 1.1 canvas<Dom Element>

```
gm.canvas.width | gm.canvas.height
```

#### 1.2 gl<gl>

#### 1.3 framebuffer<framebuffer>

```
gm.enableFramebuffer(gm.framebuffer)
gm.disableFramebuffer
```

#### 1.4 quadBuffer<buffer>

> A Square buffer. Used for a whole screen

```
#source code

this.quadBuffer = this.createBuffer(
	new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1])
)
```

### 2. methods

#### 2.1 adjustViewport()

> AdjustViewport. Usually use it once on beginning.

#### 2.2 createProgram(vertexSource<String>, fragmentSource<String>)

> Create a program

return program<Object> {
program<Object> // gm.useProgram(program.program),
attrbute1, // gm.bindAttribute(buffer, program.attrbute1)
attrbute2, // ...
...
}

#### 2.3 useProgram(program<Object>)

> Start a program

#### 2.4 createTexture(filter<String>, data<Array>, width<Number>, height<Number>)

> Same with webgl's texture

#### 2.5 createQuadTexture(width<Number>, height<Number>)

> Similiar with createTexture, but 1st, it returns a empty texture, second it's a square texture

#### 2.6 bindTexture(texture<texture>, unit<Number>)

> Bind texture with its id

#### 2.7 drawTexture(textureIndex<Number>)

> Draw texture to screen or framebuffer

#### 2.8 bindAttribute(buffer<buffer>, attribute<attribute>, num<Number>)

> Bind attribute

#### 2.9 createBuffer(data<Array>)

> CreateBuffer

#### 2.10 bindFramebuffer(framebuffer<framebuffer>, texture<texture>)

> BindFramebuffer

#### 2.11 enableFrameBuffer(texture<texture>)

> disable frameBuffer

#### 2.12 disableFrameBuffer()

> disable frameBuffer

#### 2.13 clearGL(r<Number>, g<Number>, b<Number>, a<Number>)

> Clear current canvas.r,g,b,a => 0.0 ~ 1.0

#### 2.14 clearTexture(texture<texture>, r<Number>, g<Number>, b<Number>, a<Number>)

> Clear texture. r,g,b,a => 0.0 ~ 1.0

## License

[MIT License](https://github.com/mui-org/material-ui/blob/master/LICENSE)

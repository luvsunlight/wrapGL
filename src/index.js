/**
 * @author: prozac <516060659@qq.com>
 * @createTime: 2018-4-2
 * @copyRight: MIT License
 * @discription: A set of useful funcs for webGL-based development. Unlike some handy libs
 * like three.js <https://threejs.org/> or phaser <http://www.phaserengine.com/>, webGL's
 * original funcs are quite complicated and unfriendly for newbies.So here i add some
 * commom funcs to this simple lib.
 */

import { VS_draw, FS_draw } from "./shaders"
import { getCanvas, fixRetina } from "./util"

class GLManager {
	constructor(canvasId = "canvas", option = {}) {
		let { retina = true, preserveDrawingBuffer = false } = option
		this.canvas = getCanvas(canvasId)
		this.gl = window.gl = this.canvas.getContext("webgl", {
			preserveDrawingBuffer: preserveDrawingBuffer
		})
		this.framebuffer = this.gl.createFramebuffer()
		this.quadBuffer = this.createBuffer(
			new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1])
		)
		this._drawProgram = this.createProgram(VS_draw, FS_draw)
		this.adjustViewport()

		if (retina) fixRetina(this.canvas)
	}

	adjustViewport() {
		this.gl.viewport(0, 0, this.canvas.width, this.canvas.height)
	}

	/* --- shader --- */

	createShader(type, source) {
		let gl = this.gl
		let shader = gl.createShader(type)
		gl.shaderSource(shader, source)
		gl.compileShader(shader)
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			throw new Error(gl.getShaderInfoLog(shader))
		}
		return shader
	}

	/* --- program --- */

	createProgram(vertexSource, fragmentSource) {
		let gl = this.gl
		let program = gl.createProgram()
		let vertexShader = this.createShader(gl.VERTEX_SHADER, vertexSource)
		let fragmentShader = this.createShader(
			gl.FRAGMENT_SHADER,
			fragmentSource
		)
		gl.attachShader(program, vertexShader)
		gl.attachShader(program, fragmentShader)
		gl.linkProgram(program)
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			throw new Error(gl.getProgramInfoLog(program))
		}

		let wrapper = { program: program }
		let numAttributes = gl.getProgramParameter(
			program,
			gl.ACTIVE_ATTRIBUTES
		)
		for (let i = 0; i < numAttributes; i++) {
			let attribute = gl.getActiveAttrib(program, i)
			wrapper[attribute.name] = gl.getAttribLocation(
				program,
				attribute.name
			)
		}
		let numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS)
		for (let i$1 = 0; i$1 < numUniforms; i$1++) {
			let uniform = gl.getActiveUniform(program, i$1)
			wrapper[uniform.name] = gl.getUniformLocation(program, uniform.name)
		}
		return wrapper
	}

	useProgram(program) {
		this.gl.useProgram(program.program)
	}

	/* --- texture --- */

	createTexture(filter, data, width, height) {
		let gl = this.gl
		let texture = gl.createTexture()
		gl.bindTexture(gl.TEXTURE_2D, texture)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter)
		if (data instanceof Uint8Array) {
			gl.texImage2D(
				gl.TEXTURE_2D,
				0,
				gl.RGBA,
				width,
				height,
				0,
				gl.RGBA,
				gl.UNSIGNED_BYTE,
				data
			)
		} else {
			gl.texImage2D(
				gl.TEXTURE_2D,
				0,
				gl.RGBA,
				gl.RGBA,
				gl.UNSIGNED_BYTE,
				data
			)
		}
		gl.bindTexture(gl.TEXTURE_2D, null)
		return texture
	}

	createQuadTexture(width, height) {
		let gl = this.gl
		let w = width || this.canvas.width
		let h = height || this.canvas.height
		var num = w * h
		var emptyPixels = new Uint8Array(num * 4)
		for (let i = 0; i < num * 4; i++) {
			emptyPixels[i] = 0
		}

		return this.createTexture(gl.NEAREST, emptyPixels, w, h)
	}

	bindTexture(texture, unit) {
		let gl = this.gl
		gl.activeTexture(gl.TEXTURE0 + unit)
		gl.bindTexture(gl.TEXTURE_2D, texture)
	}

	drawTexture(textureIndex) {
		let gl = this.gl
		let program = this._drawProgram
		gl.useProgram(program.program)
		this.bindAttribute(this.quadBuffer, program.a_pos, 2)
		gl.uniform1i(program.u_sampler, textureIndex)
		gl.drawArrays(gl.TRIANGLES, 0, 6)
	}

	/* --- attribute --- */

	bindAttribute(buffer, attribute, numComponents) {
		let gl = this.gl
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
		gl.enableVertexAttribArray(attribute)
		gl.vertexAttribPointer(attribute, numComponents, gl.FLOAT, false, 0, 0)
	}

	/* --- framebuffer --- */

	createBuffer(data) {
		let gl = this.gl
		let buffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
		gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
		return buffer
	}

	bindFramebuffer(framebuffer, texture) {
		let gl = this.gl
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
		if (texture) {
			gl.framebufferTexture2D(
				gl.FRAMEBUFFER,
				gl.COLOR_ATTACHMENT0,
				gl.TEXTURE_2D,
				texture,
				0
			)
		}
	}

	enableFrameBuffer(texture) {
		if (typeof texture == "undefined") {
			console.log("Please input a texture for the output of framebuffer!")
			return
		}
		this.bindFramebuffer(this.framebuffer, texture)
		this.adjustViewport()
	}

	disableFrameBuffer() {
		this.bindFramebuffer(null)
	}

	/* --- clear --- */

	clearGL(r = 0.0, g = 0.0, b = 0.0, a = 0.0) {
		let gl = this.gl
		gl.clearColor(r, g, b, a)
		gl.clear(gl.COLOR_BUFFER_BIT)
	}

	clearTexture(texture, r, g, b, a) {
		this.enableFrameBuffer(texture)
		this.clearGL(r, g, b, a)
		this.disableFrameBuffer()
	}
}

export default GLManager

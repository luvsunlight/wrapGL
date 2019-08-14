(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = global || self, global.GLManager = factory());
}(this, function () { 'use strict';

    var VS_draw = "\n    precision highp float;\n    attribute vec2 a_pos;\n    varying vec2 v_pos;\n    void main(){\n        gl_Position = vec4(2.0 * a_pos - 1.0, 0.0, 1.0);\n        v_pos = a_pos;\n    }\n";

    var FS_draw = "\n    precision highp float;\n    uniform sampler2D u_sampler;\n    varying vec2 v_pos;\n    void main(){\n\t\tgl_FragColor = texture2D(u_sampler, v_pos);\n    }\n";

    var getCanvas = function getCanvas(canvasId) {
    	var canvas = window.canvas = document.getElementById(canvasId);
    	if (canvas == null) {
    		console.log("[Warning] Please set correct webGL-output canvas's Id !");
    	}
    	return canvas;
    };

    var fixRetina = function fixRetina(canvas) {
    	var pxRatio = Math.max(Math.floor(window.devicePixelRatio) || 1, 2);
    	var ratio = pxRatio;
    	canvas.width = canvas.clientWidth * ratio;
    	canvas.height = canvas.clientHeight * ratio;
    };

    var classCallCheck = function (instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    };

    var createClass = function () {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }

      return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
      };
    }();

    /**
     * @author: prozac <516060659@qq.com>
     * @createTime: 2018-4-2
     * @copyRight: MIT License
     * @discription: A set of useful funcs for webGL-based development. Unlike some handy libs
     * like three.js <https://threejs.org/> or phaser <http://www.phaserengine.com/>, webGL's
     * original funcs are quite complicated and unfriendly for newbies.So here i add some
     * commom funcs to this simple lib.
     */

    var GLManager = function () {
    	function GLManager() {
    		var canvasId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "canvas";
    		var option = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    		classCallCheck(this, GLManager);
    		var _option$retina = option.retina,
    		    retina = _option$retina === undefined ? true : _option$retina,
    		    _option$preserveDrawi = option.preserveDrawingBuffer,
    		    preserveDrawingBuffer = _option$preserveDrawi === undefined ? false : _option$preserveDrawi;

    		this.canvas = getCanvas(canvasId);
    		this.gl = window.gl = this.canvas.getContext("webgl", {
    			preserveDrawingBuffer: preserveDrawingBuffer
    		});
    		this.framebuffer = this.gl.createFramebuffer();
    		this.quadBuffer = this.createBuffer(new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]));
    		this._drawProgram = this.createProgram(VS_draw, FS_draw);
    		this.adjustViewport();

    		if (retina) fixRetina(this.canvas);
    	}

    	createClass(GLManager, [{
    		key: "adjustViewport",
    		value: function adjustViewport() {
    			this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    		}

    		/* --- shader --- */

    	}, {
    		key: "createShader",
    		value: function createShader(type, source) {
    			var gl = this.gl;
    			var shader = gl.createShader(type);
    			gl.shaderSource(shader, source);
    			gl.compileShader(shader);
    			if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    				throw new Error(gl.getShaderInfoLog(shader));
    			}
    			return shader;
    		}

    		/* --- program --- */

    	}, {
    		key: "createProgram",
    		value: function createProgram(vertexSource, fragmentSource) {
    			var gl = this.gl;
    			var program = gl.createProgram();
    			var vertexShader = this.createShader(gl.VERTEX_SHADER, vertexSource);
    			var fragmentShader = this.createShader(gl.FRAGMENT_SHADER, fragmentSource);
    			gl.attachShader(program, vertexShader);
    			gl.attachShader(program, fragmentShader);
    			gl.linkProgram(program);
    			if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    				throw new Error(gl.getProgramInfoLog(program));
    			}

    			var wrapper = { program: program };
    			var numAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
    			for (var i = 0; i < numAttributes; i++) {
    				var attribute = gl.getActiveAttrib(program, i);
    				wrapper[attribute.name] = gl.getAttribLocation(program, attribute.name);
    			}
    			var numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    			for (var i$1 = 0; i$1 < numUniforms; i$1++) {
    				var uniform = gl.getActiveUniform(program, i$1);
    				wrapper[uniform.name] = gl.getUniformLocation(program, uniform.name);
    			}
    			return wrapper;
    		}
    	}, {
    		key: "useProgram",
    		value: function useProgram(program) {
    			this.gl.useProgram(program.program);
    		}

    		/* --- texture --- */

    	}, {
    		key: "createTexture",
    		value: function createTexture(filter, data, width, height) {
    			var gl = this.gl;
    			var texture = gl.createTexture();
    			gl.bindTexture(gl.TEXTURE_2D, texture);
    			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    			if (data instanceof Uint8Array) {
    				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    			} else {
    				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, data);
    			}
    			gl.bindTexture(gl.TEXTURE_2D, null);
    			return texture;
    		}
    	}, {
    		key: "createQuadTexture",
    		value: function createQuadTexture(width, height) {
    			var gl = this.gl;
    			var w = width || this.canvas.width;
    			var h = height || this.canvas.height;
    			var num = w * h;
    			var emptyPixels = new Uint8Array(num * 4);
    			for (var i = 0; i < num * 4; i++) {
    				emptyPixels[i] = 0;
    			}

    			return this.createTexture(gl.NEAREST, emptyPixels, w, h);
    		}
    	}, {
    		key: "bindTexture",
    		value: function bindTexture(texture, unit) {
    			var gl = this.gl;
    			gl.activeTexture(gl.TEXTURE0 + unit);
    			gl.bindTexture(gl.TEXTURE_2D, texture);
    		}
    	}, {
    		key: "drawTexture",
    		value: function drawTexture(textureIndex) {
    			var gl = this.gl;
    			var program = this._drawProgram;
    			gl.useProgram(program.program);
    			this.bindAttribute(this.quadBuffer, program.a_pos, 2);
    			gl.uniform1i(program.u_sampler, textureIndex);
    			gl.drawArrays(gl.TRIANGLES, 0, 6);
    		}

    		/* --- attribute --- */

    	}, {
    		key: "bindAttribute",
    		value: function bindAttribute(buffer, attribute, numComponents) {
    			var gl = this.gl;
    			gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    			gl.enableVertexAttribArray(attribute);
    			gl.vertexAttribPointer(attribute, numComponents, gl.FLOAT, false, 0, 0);
    		}

    		/* --- framebuffer --- */

    	}, {
    		key: "createBuffer",
    		value: function createBuffer(data) {
    			var gl = this.gl;
    			var buffer = gl.createBuffer();
    			gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    			gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    			return buffer;
    		}
    	}, {
    		key: "bindFramebuffer",
    		value: function bindFramebuffer(framebuffer, texture) {
    			var gl = this.gl;
    			gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    			if (texture) {
    				gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    			}
    		}
    	}, {
    		key: "enableFrameBuffer",
    		value: function enableFrameBuffer(texture) {
    			if (typeof texture == "undefined") {
    				console.log("Please input a texture for the output of framebuffer!");
    				return;
    			}
    			this.bindFramebuffer(this.framebuffer, texture);
    			this.adjustViewport();
    		}
    	}, {
    		key: "disableFrameBuffer",
    		value: function disableFrameBuffer() {
    			this.bindFramebuffer(null);
    		}

    		/* --- clear --- */

    	}, {
    		key: "clearGL",
    		value: function clearGL() {
    			var r = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0.0;
    			var g = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0.0;
    			var b = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0.0;
    			var a = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0.0;

    			var gl = this.gl;
    			gl.clearColor(r, g, b, a);
    			gl.clear(gl.COLOR_BUFFER_BIT);
    		}
    	}, {
    		key: "clearTexture",
    		value: function clearTexture(texture, r, g, b, a) {
    			this.enableFrameBuffer(texture);
    			this.clearGL(r, g, b, a);
    			this.disableFrameBuffer();
    		}
    	}]);
    	return GLManager;
    }();

    return GLManager;

}));

const VS_draw = `
    precision highp float;
    attribute vec2 a_pos;
    varying vec2 v_pos;
    void main(){
        gl_Position = vec4(2.0 * a_pos - 1.0, 0.0, 1.0);
        v_pos = a_pos;
    }
`

const FS_draw = `
    precision highp float;
    uniform sampler2D u_sampler;
    varying vec2 v_pos;
    void main(){
		gl_FragColor = texture2D(u_sampler, v_pos);
    }
`

export { VS_draw, FS_draw }

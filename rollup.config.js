import resolve from "rollup-plugin-node-resolve"
import babel from "rollup-plugin-babel"

const DIST_PATH = "dist"

export default [
	{
		file: `${DIST_PATH}/index.umd.js`,
		format: "umd",
		name: "GL"
	},
	{
		file: `${DIST_PATH}/index.es.js`,
		format: "es"
	},
	{
		file: `${DIST_PATH}/index.common.js`,
		format: "cjs"
	}
].map(output => ({
	input: "src/index.js",
	output,
	plugins: [
		resolve(),
		babel({
			exclude: "node_modules/**"
		})
	]
}))

const getCanvas = canvasId => {
	const canvas = (window.canvas = document.getElementById(canvasId))
	if (canvas == null) {
		console.log("[Warning] Please set correct webGL-output canvas's Id !")
	}
	return canvas
}

const fixRetina = canvas => {
	let pxRatio = Math.max(Math.floor(window.devicePixelRatio) || 1, 2)
	let ratio = pxRatio
	canvas.width = canvas.clientWidth * ratio
	canvas.height = canvas.clientHeight * ratio
}

export { getCanvas, fixRetina }

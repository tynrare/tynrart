function BitmapLevel(w, h, pixdata) {
    const width = w;
    const height = h;
    const data = pixdata;
}

function BitmapPhyscore() {
	const vcanvas = document.createElement("canvas");
	const vctx = vcanvas.getContext("2d");

    const mapcaches = {};

    this.cachemap = cachemap;
    this.bline = bline;

    function bline(x0, y0, x1, y1, callback) {
		var dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
		var dy = Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
		var err = (dx>dy ? dx : -dy)/2;

		while (callback(x0, y0) !== false) {
			if (x0 === x1 && y0 === y1) break;
			var e2 = err;
			if (e2 > -dx) { err -= dy; x0 += sx; }
			if (e2 < dy) { err += dx; y0 += sy; }
		}
	}

    function cachemap(img, key) {
        if (vcanvas.width != img.width || vcanvas.height != img.height) {
			vcanvas.width = img.width;
			vcanvas.height = img.height;
		}

        vctx.drawImage(img, 0, 0);
        const bitmap = vctx.getImageData(0, 0, img.width, img.height);

        mapcaches[key] = new BitmapLevel(img.width, img.height, bitmap.data);
    }

	function getmap(key) {
		return mapcaches[key];
	}

	function get_index_at_map(mapkey, x, y) {
		const map = getmap(key);
	}
}

export { BitmapLevel, BitmapPhyscore };
function Config(src) {
	this.get = (key) => {
		return Number(src.getAttribute(key));
	}
}

function Tileset(element) {
	this.tilewidth = Number(element.getAttribute("tilewidth"));
	this.tileheight = Number(element.getAttribute("tileheight"));
	const pad = Number(element.getAttribute("pad"));
	const tiles = {};

	this.gettile = (key) => {
		return tiles[key];
	}

	for (let i = 0; element && i < element.childNodes.length; i++) {
		const tile = element.childNodes[i];
		const key = tile.id;
		if (!key) {
			continue;
		}

		const x = Number(tile.getAttribute("x"));
		const y = Number(tile.getAttribute("y"));

		tiles[key] = {
			x: x * (this.tilewidth + pad),
			y: y * (this.tileheight + pad)
		}
	}
}

function CanvasApp(config) {
	const images = {};
	const tilesets = {};
	
	this.run = run;
	this.draw = draw;
	this.drawtile = drawtile;
	this.update = update;
	this.resize = resize;

	this.get_image = get_image;
	this.get_vpwidth = get_vpwidth;
	this.get_vpheight = get_vpheight;

	const CELLSIZE = config.get("cellsize") ?? 64;
	
	let canvas = null;
	let ctx = null;

	this.get_cz = () => { return CELLSIZE };
	this.get_ctx = () => { return ctx };
		
	let viewport_w = 128;
	let viewport_h = 128;
	let viewport_cw = viewport_w / CELLSIZE;
	let viewport_ch = viewport_h / CELLSIZE;
	let viewport_len = viewport_w * viewport_h;
	let viewport_clen = viewport_cw * viewport_ch;

	const vcanvas = document.createElement("canvas");
	const vctx = vcanvas.getContext("2d");

	function get_image(key) {
		return images[key];
	}

	function get_vpwidth() {
		return viewport_cw;
	}

	function get_vpheight() {
		return viewport_ch;
	}
	
	function _predraw() {
		ctx.msImageSmoothingEnabled = false;
		ctx.mozImageSmoothingEnabled = false;
		ctx.webkitImageSmoothingEnabled = false;
		ctx.imageSmoothingEnabled = false;	
	}
	
	function drawtile(imgname, tilename, x, y) {
		_predraw();
		const tileset = tilesets[imgname];
		const tile = tileset.gettile(tilename);
		const image = get_image(imgname);
		ctx.drawImage(image, tile.x, tile.y, tileset.tilewidth, tileset.tileheight, x * CELLSIZE, y * CELLSIZE, CELLSIZE, CELLSIZE)
	}

	function draw(imgname, x, y) {
		_predraw();
		const image = get_image(imgname);
		ctx.drawImage(image, x * CELLSIZE, y * CELLSIZE, CELLSIZE, CELLSIZE);
	}
	
	// --- game

	function gettilename(r, g, b, a) {
		if (r === 0) {
			return "wall0";
		} else {
			return "ground1";
		}
	}

	function drawmap(imgname) {
		const img = images[imgname];
		if (vcanvas.width != img.width || vcanvas.height != img.height) {
			vcanvas.width = img.width;
			vcanvas.height = img.height;
		}

		vctx.drawImage(img, 0, 0);

		const cox = Math.floor(viewport_cw * 0.5);
		const coy = Math.floor(viewport_ch * 0.5);
		const mox = Math.floor(img.width * 0.5);
		const moy = Math.floor(img.width * 0.5);

		const bitmap = vctx.getImageData(0, 0, img.width, img.height);
		const len = bitmap.data.length / 4;
		for (let i = 0; i < len; i++) {
			const di = i * 4;
			const r = bitmap.data[di];
			const g = bitmap.data[di + 1];
			const b = bitmap.data[di + 2];
			const a = bitmap.data[di + 3];
			const tilename = gettilename(r, g, b, a);

			const x = i % img.width;
			const y = Math.floor(i / img.width);

			drawtile("tilemap", tilename, x + cox - mox, y + coy - moy);
		}
	}

	function update(levelname) {
		for (let i = 0; i < viewport_clen; i++) {
			const x = i % viewport_cw;
			const y = Math.floor(i / viewport_cw);
			drawtile("tilemap", "ground0", x, y);
		}
		drawmap(levelname);
	}
	
	// --- tek

	function resize() {
		const w = document.body.clientWidth;
		const h = document.body.clientHeight;
		if (w == viewport_w && h == viewport_h) {
			return false;
		}
		
		viewport_w = w;
		viewport_h = h;
		viewport_cw = Math.floor(viewport_w / CELLSIZE) + 1;
		viewport_ch = Math.floor(viewport_h / CELLSIZE) + 1;
		
		viewport_len = viewport_w * viewport_h;
		viewport_clen = viewport_cw * viewport_ch;
		
		canvas.width = viewport_w = w;
		canvas.height = viewport_h = h;

		return true;
	}
	
	function load() {
		const dbimages = document.querySelector("db#images");
		for (let i = 0; dbimages && i < dbimages.childNodes.length; i++) {
			const img = dbimages.childNodes[i];
			const key = img.id;
			if (!key) {
				continue;
			}
			
			images[key] = img;
		}

		const dbtilemaps = document.querySelector("db#tilemaps");
		for (let i = 0; dbtilemaps && i < dbtilemaps.children.length; i++) {
			const tilemap = dbtilemaps.children[i];
			const key = tilemap.getAttribute("image");
			if (!key || !images[key]) {
				continue;
			}

			tilesets[key] = new Tileset(tilemap);
		}
	}
	
	/**
	* @param {CanvasElement} canvaselement .
	*/
	function run(canvaselement) {
		canvas = canvaselement;
		ctx = canvas.getContext("2d");
		load();
		resize();
	}
}

export { Config, CanvasApp }
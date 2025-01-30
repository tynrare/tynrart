main();

function Config(src) {
	this.get = (key) => {
		return Number(src.getAttribute(key));
	}
}

function App(config) {
	const images = {};
	let images_len = 0;
	let images_keys = [];
	
	this.run = run;
		
	const CELLSIZE = config.get("cellsize") ?? 16;
	const Tc = config.get("timestep") ?? 1;
	const timescale = config.get("timescale") ?? 1;
		
	let elapsed = 0;
	let active = false;
	let canvas = null;
	let ctx = null;
	let viewport_w = 128;
	let viewport_h = 128;
	let viewport_cw = viewport_w / CELLSIZE;
	let viewport_ch = viewport_h / CELLSIZE;
	let viewport_len = viewport_w * viewport_h;
	let viewport_clen = viewport_cw * viewport_ch;
	
	let STARTSTAMP = -1;
	

	let _th = 0;
	
	function _predraw() {
	ctx.msImageSmoothingEnabled = false;
	ctx.mozImageSmoothingEnabled = false;
	ctx.webkitImageSmoothingEnabled = false;
	ctx.imageSmoothingEnabled = false;	
	}
	
	function draw(imgname, x, y) {
		_predraw();
		ctx.drawImage(images[imgname], x * CELLSIZE, y * CELLSIZE, CELLSIZE, CELLSIZE);
	}
	
	function bline(x0, y0, x1, y1) {
		var dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
		var dy = Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
		var err = (dx>dy ? dx : -dy)/2;

		while (true) {
			draw("tile", x0,y0);
			if (x0 === x1 && y0 === y1) break;
			var e2 = err;
			if (e2 > -dx) { err -= dy; x0 += sx; }
			if (e2 < dy) { err += dx; y0 += sy; }
		}
	}
	
	// --- game
	
	function step(dt) {
		const t = Math.floor(elapsed);
		const x = t % viewport_cw;
		const y = Math.floor(t / viewport_cw) % viewport_ch;
		
		const im = Math.floor(t / viewport_clen);
		const imgkey = images_keys[im % images_len];

		draw(imgkey, x, y);

		bline(4, 4, 7, 10);
	}
	
	// --- tek

	function resize() {
		const w = document.body.clientWidth;
		const h = document.body.clientHeight;
		if (w == viewport_w && h == viewport_h) {
			return;
		}
		
		viewport_w = w;
		viewport_h = h;
		viewport_cw = Math.floor(viewport_w / CELLSIZE) + 1;
		viewport_ch = Math.floor(viewport_h / CELLSIZE) + 1;
		
		viewport_len = viewport_w * viewport_h;
		viewport_clen = viewport_cw * viewport_ch;
		
		canvas.width = viewport_w = w;
		canvas.height = viewport_h = h;
	}
	
	function _stampcorrection(timestamp) {
		if (STARTSTAMP === -1) {
			STARTSTAMP = timestamp;
			console.log("LOADTIME:", timestamp);
		}
		
		return timestamp - STARTSTAMP;
	}

	function loop(e = 0) {
		if (!active || !canvas || !ctx) {
			return;
		}
		
		resize();
		
		requestAnimationFrame(loop);
		
		if (e === 0) {
			return;
		}
		
		const sce = _stampcorrection(e);
		const se = sce * timescale * 1e-3;
		
		const dt = se - elapsed;
		elapsed = se;
		
		_th += dt;
		
		if (_th < Tc) {
			return;
		} else {
			_th -= Tc;
		}
		
		step(dt);
	}
	
	function load() {
		const dbimages = document.querySelector("db#images");
		for (let i = 0; dbimages && i < dbimages.childNodes.length; i++) {
			const img = dbimages.childNodes[i];
			const key = img.id;
			if (!key) {
				continue;
			}
			
			images_len += 1;
			images_keys.push(key);
			images[key] = img;
		}
	}
	

	/**
	* @param {CanvasElement} canvaselement .
	*/
	function run(canvaselement) {
		canvas = canvaselement;
		ctx = canvas.getContext("2d");
		active = true;
		load();
		loop();
	}

	function stop() {
		active = false;
	}

}

function main() {
	const canvaselement = document.querySelector("#level_canvas_d0");
	const configelement = document.querySelector("config");
	const config = new Config(configelement);
	const app = new App(config);
	app.run(canvaselement);
}

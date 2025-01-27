main();

function App() {
	this.run = run;
	
	let elapsed = 0;
	let active = false;
	let canvas = null;
	let ctx = null;
	let viewport_w = 128;
	let viewport_h = 128;
	
	let th = 0;
	let Tc = 1000;
	
	// --- game
	
	function step(dt) {
		
		const s = 16;

		const t = Math.floor(elapsed * 1e-3);
		const ts = t * s;
		const x = ts % viewport_w;
		const y = Math.floor(ts / viewport_w) * s;
		
		ctx.fillStyle = "#FFFEFF";
		ctx.fillRect(x, y, s, s);
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
		
		canvas.width = viewport_w = w;
		canvas.height = viewport_h = h;
	}

	function loop(e = 0) {
		if (!active || !canvas || !ctx) {
			return;
		}
		
		resize();
		
		requestAnimationFrame(loop);
		
		const dt = e - elapsed;
		elapsed = e;
		
		th += dt;
		
		if (th < Tc) {
			return;
		} else {
			th -= Tc;
		}
		
		step(dt);
	}
	

	/**
	* @param {CanvasElement} canvaselement .
	*/
	function run(canvaselement) {
		canvas = canvaselement;
		ctx = canvas.getContext("2d");
		active = true;
		
		loop();
	}

	function stop() {
		active = false;
	}

}

function main() {
	const canvaselement = document.querySelector("#level_canvas_d0");
	const app = new App();
	app.run(canvaselement);
}
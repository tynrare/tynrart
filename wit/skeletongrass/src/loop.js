function Loop(config, callback) {
    this.run = run;
    this.stop = stop;

    let active = false;
	
	let STARTSTAMP = -1;
	let _th = 0;
	let elapsed = 0;
	const Tc = config.get("timestep") ?? 1;
	const timescale = config.get("timescale") ?? 1;


	function loop(e = 0) {
		if (!active) {
			return;
		}
		
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

    function step(dt) {
        callback(dt);
    }
    
    function run() {
        active = true;
        loop();

        return this;
    }

    function stop() {
        active = false;
    }

    
	function _stampcorrection(timestamp) {
		if (STARTSTAMP === -1) {
			STARTSTAMP = timestamp;
			console.log("LOADTIME:", timestamp);
		}
		
		return timestamp - STARTSTAMP;
	}
}

export default Loop;
export { Loop };
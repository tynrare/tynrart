var skeletyn = (window.skeletyn = window.skeletyn ?? {});

/**
* @param {Assets} assets .
* @param {CanvasApp} capp .
* @returns {SkeleApp} 
*/
skeletyn.run = (assets, capp) => {
	const sapp = new skeletyn.SkeleApp(assets, capp);
	sapp.run();
	
	const loop = new tynbox.Loop(() => {
		if (capp.resize()) {
			sapp.recalc();
			sapp.drawmap();
		}
	});
	loop.run();
	
	sapp.drawmap();
	
	return sapp;
}

const DATALAYERS = {
	ENTITY: 0,
	SPRITE: 1,
	UID: 2,
	PLAYSTATE: 3
}

const db = {
	sprites: {},
	entities: {}
}

skeletyn.SkeleApp = SkeleApp;
skeletyn.loaddb = loaddb;
skeletyn.db = db;


function SkeleLevelZero(w, h) {
	this.make = make;
	this.apply_to_entitytype = apply_to_entitytype;
	this.putentity = putentity;
	
	
	const liminalspace = new tynbox.LiminalSpace(w, h, 1, 4);
	const liminaldata = new tynbox.LiminalData(liminalspace, 4);
	
	this.get_liminaldata = () => { return liminaldata };
	this.get_liminalspace = () => { return liminalspace };
	this.get_w = () => { return w };
	this.get_h = () => { return h };
	
	function putentity(cellindex, entityid, spriteid, uid = 0) {
		liminaldata.setv(entityid, cellindex, DATALAYERS.ENTITY);
		liminaldata.setv(spriteid, cellindex, DATALAYERS.SPRITE);
		liminaldata.setv(uid, cellindex, DATALAYERS.UID);
	}
	
	function apply_to_entitytype(typeindex, callback) {
		for (let i = 0; i < liminalspace.get_len(); i++) {
			const v = liminaldata.getv(i, DATALAYERS.ENTITY);
			if (v === typeindex) {
				callback(i);
			}
		}
	}
	
	function make() {
		// make map ground
		for (let i = 0; i < liminaldata.get_len(); i += liminalspace.get_lw()) {
			const v = makecheckergrid(i / liminalspace.get_lw(), w) + 4; 
			putentity(i, db.entities["ground0"], v);
		}
		
		const PAWNA_SPAWN_CELL = 0;
		putentity(PAWNA_SPAWN_CELL + 1, db.entities["pawn0"], db.sprites["pawn0"], 1);
		
		
		// place wall
		const lw = liminalspace.get_lw();
		const wallstoplace = [17, 19, 42];
		for (const i in wallstoplace) {
			const v = wallstoplace[i];
			const vi = v * lw + 1;
			putentity(vi, db.entities["solid0"], db.sprites["wall0"]);
		}
		
		const cratestoplace = [1, 50, 51];
		for (const i in cratestoplace) {
			const v = cratestoplace[i];
			const vi = v * lw + 1;
			putentity(vi, db.entities["crate0"], db.sprites["crate0"]);
		}
		
		const mobstoplace = [22, 20, 55];
		for (const i in mobstoplace) {
			const v = mobstoplace[i];
			const vi = v * lw + 1;
			putentity(vi, db.entities["mob0"], db.sprites["mob_bat"]);
		}
	}
}

function SkeleApp(assets, capp) {
	let map_origin = 0;
	const level = new SkeleLevelZero(8, 8);
	const liminalspace = level.get_liminalspace();
	const liminaldata = level.get_liminaldata();
	
	this.drawmap = drawmap;
	this.run = run;
	this.recalc = recalc;
	this.drawtile = drawtile;
	this.get_level = () => { return level };
	this.get_db = () => { return db };
	this.get_map_origin = () => { return map_origin };
	
	function run() {
		level.make();
		recalc();
	}
	

	function recalc() {
		const sw = liminalspace.get_lx();
		const sh = liminalspace.get_ly();
		const dw = capp.get_liminalspace().get_lx();
		const dh = capp.get_liminalspace().get_ly();
		
		const canvas_center_x = Math.floor(dw / 2) - Math.floor(sw / 2);
		const canvas_center_y = Math.floor(dh / 2) - Math.floor(sh / 2);
		const cindex = capp.get_liminalspace().get_index_of(canvas_center_x, canvas_center_y);
		map_origin = cindex;
	}
	
	const tileset = assets.get_asseti("tileset", 0);
	function draw(spriteindex, cellindex) {
		if (spriteindex === 0) {
			return;	
		}
		capp.drawtile(tileset, spriteindex, cellindex);
	}
	
	function drawentity(sindex, dindex) {
		const entityindex = liminaldata.getv(sindex, DATALAYERS.ENTITY);
		if (entityindex === 0) {
			return;	
		}
		
		draw(liminaldata.getv(sindex, DATALAYERS.SPRITE), dindex);
	}
	
	function drawtile(sindex) {
		const ssindex = sindex - (sindex % liminalspace.get_lw());
		const ay = liminalspace.get_y_of(sindex);
		const dw = capp.get_liminalspace().get_lx();
		const dh = capp.get_liminalspace().get_ly();
			
		const pindex = ssindex / liminalspace.get_lw() + (dw - liminalspace.get_lx()) * ay;
		const cellindex = pindex + map_origin;
		cleartile(cellindex);
		
		for (let i = 0; i < liminalspace.get_lw(); i++) {
			drawentity(ssindex + i, cellindex);
		}
	}
	
	function drawmap() {
		const len = liminalspace.get_len();
		
		for (let i = 0; i < len; i += liminalspace.get_lw()) {
			drawtile(i);
		}
	}
	
	function cleartile(index) {
		capp.cleartile(index);
	}
}

function loaddb(id, objkey) {
	const dbel = document.querySelector(id);
	for (let i = 0; dbel && i < dbel.children.length; i++) {
	  const el = dbel.children[i];
	  const name = el.getAttribute("name");
	  const index = el.getAttribute("index");
	  db[objkey][name] = Number(index);
	}
}

function makecheckergrid(index, w) {
	const x = index % w;
	const y = Math.floor(index / w);
	return (x + y % 2) % 2; // checkerboard
}
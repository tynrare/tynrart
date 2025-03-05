var tynbox = (window.tynbox = window.tynbox ?? {});


tynbox.run = () => {
    return onload().then(delay).then(loadingdone).then();
};

// pL4

tynbox.CanvasApp = CanvasApp;
tynbox.Loop = Loop;

// pL3

tynbox.LiminalData = LiminalData;
tynbox.LiminalSpace = LiminalSpace;

// pL2

tynbox.Assets = Assets;

// pL1

tynbox._predraw = _predraw;
tynbox._onload = onload;
tynbox.delay = delay;
tynbox._loadingdone = loadingdone;
tynbox.bline = bline;

// ----

// L4


/**
 * @param {HTMLCanvasElement} canvas .
 * @param {number} cz .
 */
function CanvasApp(canvas, cz = 64) {
  let liminalspace = null;
  let ctx = canvas.getContext("2d");

  this.drawtile = drawtile;
  this.cleartile = cleartile;
  this.resize = resize;
  this.run = run;
  this.clearall = clearall;

  this.get_liminalspace = () => { return liminalspace; }
  this.get_canvas = () => { return canvas };
  this.get_cz = () => { return cz };
  
  function run() {
	resize();
  }

  function drawtile(tileset, spriteindex, cellindex) {
    const sx = tileset.get_x_of(spriteindex);
    const sy = tileset.get_y_of(spriteindex);

    const dx = liminalspace.get_x_of(cellindex) * cz;
    const dy = liminalspace.get_y_of(cellindex) * cz;

    const tw = tileset.get_cz();

    tynbox._predraw(ctx);
    ctx.drawImage(tileset.get_img(), sx, sy, tw, tw, dx, dy, cz, cz);
  }

  function cleartile(index) {
    const x = liminalspace.get_x_of(index) * cz;
    const y = liminalspace.get_y_of(index) * cz;
    ctx.clearRect(x, y, cz, cz);
  }

  function resize() {
    const cw = document.body.clientWidth;
    const ch = document.body.clientHeight;
    const bw = cw - (cw % cz);
    const bh = ch - (ch % cz);
    if (bw != canvas.width || bh != canvas.height || !liminalspace) {
      canvas.width = bw;
      canvas.height = bh;
    } else {
      return false;
    }

    const w = Math.floor(bw / cz);
    const h = Math.floor(bh / cz);
    const len = w * h;

    liminalspace = new tynbox.LiminalSpace(w, h);
    return true;
  }
  
  function clearall() {
	  ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  
}

function Loop(callback, th = 0) {
  let active = false;
  this.run = run;
  this.stop = stop;

  function run() {
    active = true;
    loop();
  }

  function stop() {
    active = false;
  }
  
  let timestamp = 0;

  function loop(ts) {
    if (!active) {
      return;
    }
	
	requestAnimationFrame(loop);
	
	const dt = ts - timestamp;
	if (dt < th) {
		return;
	}
	
	timestamp = ts;
	
    callback(dt);
  }
}

// L3

/**
* @param {LiminalSpace} liminalspace
*/
function LiminalData(liminalspace, propsize = 4) {
	let data = new Uint16Array(liminalspace.get_len() * propsize);
	
	this.get_len = liminalspace.get_len;
	this.get_data = () => { return data };
	this.setv = setv;
	this.getv = getv;
	this.copycell = copycell;
	
	function setv(v, index, layer) {
		data[index * propsize + layer] = v;
	}
	
	function getv(index, layer) {
		return data[index * propsize + layer];
	}
	
	function copycell(indexfrom, indexto) {
		for (let w = 0; w < propsize; w++) {
			setv(getv(indexfrom, w), indexto, w);
		}
	}
}

/**
* Замкнутое, лимитированное, трехмерное пространство.
* Также каждая "клетка" этого пространства - дополнительное
* одномерное пространство, то есмь имеет собсвенную глубину.
*
* @param {number} lx limit x
* @param {number} ly limit y
* @param {number} w cell "depth"
* @param {number} lz limit z
*/
function LiminalSpace(lx, ly, lz = 1, lw = 1, len = lx * ly * lz * lw) {
    this.get_x_of = get_x_of;
    this.get_y_of = get_y_of;
    this.get_z_of = get_z_of;
	this.get_w_of = get_w_of;
    this.get_safe_index = get_safe_index;
	this.get_index_of = get_index_of;
	this.wrap = wrap;
	this.warp = warp;
	this.move = move;

	this.get_foldlen = () => { return len / lw };
    this.get_len = () => { return len };
    this.get_lx = () => { return lx };
    this.get_ly = () => { return ly };
	this.get_lz = () => { return lz };
	this.get_lw = () => { return lw };

	const lxw = lx * lw;
    const aplatform = lxw * ly;
	
    function get_safe_index(index) {
		return wrap(index, len);

    }
	function get_index_of(x, y, z = 0, w = 0) {
		return z * (lx * ly * lw) + y * (lx * lw) + x * lw + w;
	}
	
    function get_x_of(index, _lx = lx) {
        const sindex = get_safe_index(index);
        const v = Math.floor(sindex / lw) % _lx;

        return v;
    }
    function get_y_of(index, _lx = lxw) {
        const sindex = get_safe_index(index);
        const v = Math.floor(sindex / _lx);

        return v;
    }
    function get_z_of(index) {
        const sindex = get_safe_index(index);
        const v = Math.floor(sindex / aplatform);

        return v;
    }
	function get_w_of(index) {
        const sindex = get_safe_index(index);
        const v = sindex % lw;

        return v;
    }
	function wrap(v, limit) {
		const sv = v % limit;
        if (sv < 0) {
            return limit + sv;
        }
        return sv;
	}
	function warp(v, offset, w) {
		const offsetx = get_x_of(offset);
		const offsety = get_y_of(offset);
		const mapx = get_x_of(v, w);
		const mapy = get_y_of(v, w);
		
		return get_index_of(offsetx + mapx, offsety + mapy);
	}
	function move(index, dx, dy) {
		const xa = get_x_of(index);
		const ya = get_y_of(index);
		const wa = get_w_of(index);
		const xb = wrap(xa + dx, lx);
		const yb = wrap(ya + dy, ly);
		const cellindexb = get_index_of(xb, yb, 0, wa);
		
		return cellindexb;
	}
}

function TilesetImg(img, w, l, cz, pad = 0) {
    const liminalspace = new LiminalSpace(w, Math.floor(l / w), 1, 1, l);
    this.get_x_of = get_x_of;
    this.get_y_of = get_y_of;
    this.get_cz = () => { return cz };
    this.get_img = () => { return img };
	this.warp = liminalspace.warp;

    function get_x_of(index) {
        const v = liminalspace.get_x_of(index);

        return v * (cz + pad);
    }

    function get_y_of(index) {
        const v = liminalspace.get_y_of(index);


        return v * (cz + pad);
    }
}

// L2

function Assets() {
  const _dbassets = {};

  this.get_assetk = get_assetk;
  this.get_asseti = get_asseti;
    this.init = init;

  function init(dbassets) {
    for (let i = 0; dbassets && i < dbassets.children.length; i++) {
      const asset = dbassets.children[i];
      init_asset(asset);
    }
  }

  function get_assetk(gkey, akey) {
    const gdb = _dbassets[gkey]?.k[akey].element;
    return gdb;
  }

  function get_asseti(gkey, aindex) {
    const gdb = _dbassets[gkey]?.i[aindex]?.element;
    return gdb;
  }

  function assign_asset(element, gkey, ekey = null) {
    const adb = (_dbassets[gkey] = _dbassets[gkey] ?? {
      count: 0,
      i: {},
      k: {},
    });
    const asset = { element, index: adb.count };
    adb.i[adb.count++] = asset;
    if (ekey) {
      adb.k[ekey] = asset;
    }
  }

  function _init_asset_tileset(element) {
    const w = element.getAttribute("w") ?? 8;
    const l = element.getAttribute("l") ?? 8;
    const cs = element.getAttribute("cs") ?? 16;
    const pad = element.getAttribute("pad") ?? 0;
    const tileset = new TilesetImg(
      element,
      Number(w),
      Number(l),
      Number(cs),
      Number(pad)
    );
    assign_asset(tileset, "tileset", element.id);
  }

  function _init_asset_image(element) {
    const assign = element.getAttribute("assign");
    assign_asset(element, "image", element.id);

    switch (assign) {
      case "tileset":
        _init_asset_tileset(element);
        break;
    }
  }
  
  function _init_asset_tilemap(element) {
	const w = element.getAttribute("w") ?? 8;
    const l = element.getAttribute("l") ?? 8;
	const offset = element.getAttribute("offset") ?? 0;
	const tilemap = new Tilemap(Number(offset), Number(w), Number(l));
	assign_asset(tilemap, "tilemap", element.id);
  }

  function init_asset(element) {
    assign_asset(element, "asset", element.id);
    switch (element.tagName) {
      case "IMG":
      case "IMAGE":
        _init_asset_image(element);
        break;
	  case "TILEMAP":
		//_init_asset_tilemap(element);
    }
  }
}

// -L1

function _predraw(ctx) {
  ctx.msImageSmoothingEnabled = false;
  ctx.mozImageSmoothingEnabled = false;
  ctx.webkitImageSmoothingEnabled = false;
  ctx.imageSmoothingEnabled = false;
}

function onload() {
  return Promise.all(
    Array.from(document.images).map((img) => {
      if (img.complete) return Promise.resolve(img.naturalHeight !== 0);
      return new Promise((resolve) => {
        img.addEventListener("load", () => resolve(true));
        img.addEventListener("error", () => resolve(false));
      });
    })
  ).then((results) => {
    if (results.every((res) => res))
      console.log("all images loaded successfully");
    else console.log("some images failed to load, all finished loading");
  });
}

function delay() {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, 420);
  });
}

function loadingdone() {
  const el = document.querySelector("#splashscreenloading");
  el?.classList.add("hidden");
}

// --- exstras

function bline(x0, y0, x1, y1, callback) {
  var dx = Math.abs(x1 - x0),
    sx = x0 < x1 ? 1 : -1;
  var dy = Math.abs(y1 - y0),
    sy = y0 < y1 ? 1 : -1;
  var err = (dx > dy ? dx : -dy) / 2;

  while (callback(x0, y0) !== false) {
    if (x0 === x1 && y0 === y1) break;
    var e2 = err;
    if (e2 > -dx) {
      err -= dy;
      x0 += sx;
    }
    if (e2 < dy) {
      err += dx;
      y0 += sy;
    }
  }
}

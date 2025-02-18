function MapGen() {
    this.makecheckergrid = makecheckergrid;
    function makecheckergrid(index, w) {
        const x = index % w;
        const y = Math.floor(index / w);
        return (x + y % 2) % 2; // checkerboard
    }
}

const mapgen = new MapGen();

function main(STEPS_N = 66) {
    const vcanvas = document.querySelector("#vcanvas");
    const vctx = vcanvas?.getContext("2d") ?? null;
    const canvaselement = document.querySelector("#bitmap_canvas");
    const ctx = canvaselement.getContext("2d");

    const images = {};
    const bitmaps = {};
    const tiles = {};
    load();
    function load() {
        if (vcanvas) {
            bitmaps["level0"] = genbitlevel(8, 8, mapgen.makecheckergrid);
            bitmaps["props0"] = genbitlevel(8, 8, (i) => { return i === 0 ? 2 : 0; });
        }
        const dbimages = document.querySelector("db#images");
        for (let i = 0; dbimages && i < dbimages.children.length; i++) {
            const img = dbimages.children[i];
            const key = img.id;
            if (!key) {
                continue;
            }
            
            images[key] = img;
        }

        const dbtiles = document.querySelector("db#tileproxy");
        for (let i = 0; dbtiles && i < dbtiles.children.length; i++) {
            const tile = dbtiles.children[i];
            const key = tile.id;
            const mapindex = tile.getAttribute("mapindex");
            const tileindex = tile.getAttribute("tileindex")
            if (!mapindex) {
                continue;
            }

            tiles[Number(mapindex)] = Number(tileindex);
        }
    }

    let tilesetname = "tileset";

    
    function gettileset(imgkey = tilesetname) {
        return images[imgkey ?? tilesetname];
    }
    
    function gettilesetattribute(key, imgkey = tilesetname) {
        return Number(gettileset(imgkey).getAttribute(key) ?? 0);
    }

    const tw = 16;
    const twp = tw + 1;
    const cz = 64;
    const d = (sx, sy, wx, wy, tileset) => {
        ctx.drawImage(tileset ?? gettileset(), sx * (twp), sy * (twp), tw, tw, wx * cz, wy * cz, cz, cz);
    }

    function drawtile(index, x, y, imgkey) {
        const w = gettilesetattribute("w", imgkey) || 49;
        const l = gettilesetattribute("l", imgkey) || 1078;


        const lax = index % l;
        const ax = lax % w;
        const ay = Math.floor(lax / w);

        _predraw(ctx);
        d(ax, ay, x, y, gettileset(imgkey));
    }

    
    let steps = STEPS_N;
    let stepx = 0;

    function _step_goats(ss = steps, sx = stepx) {
        // --- x 1
        const bw = Math.ceil(canvaselement.width / cz);
        const bh = Math.ceil(canvaselement.height / cz);
        const lbx = sx % (bw * bh);
        const bx = lbx % bw;
        const by = Math.floor(lbx / bw);
        drawtile(ss, bx, by)

        // --- x 2

        if (vcanvas) {
            const s = bw < bh ? bw : bh;
            drawmap("level0");
            drawmap("props0", "tileset1_t");
        }
    }

    function unstep(d = -1, x = -1) {
        //steps = Math.max(steps + d, 0);
        //_step_goats(steps, stepx);
    }
    function tostep(d = 1, x = 1) {
        _step_goats(steps, stepx);
        steps = (steps + d) % 0xffffff;
    }

    function step(d = 1, x = 1) {
        if (x < 0) {
            stepx = Math.max(stepx + x, 0);
        }

        tostep(d, x);

        if (x > 0) {
            stepx = (stepx + x) % 0xffffff;
        }
    }

    const tilesetoptions = ["tileset", "tileset1", "tileset2"];
    let tilesetshiftindex = 0;
    function shift(d) {
        tilesetshiftindex = (tilesetshiftindex + 1) % tilesetoptions.length;
        tilesetname = tilesetoptions[tilesetshiftindex];
    }

    function Inputs() {
        let ticking = false;
        function scroll(d) {
            const s = Math.sign(d);
            step(s, s);
        }

        document.addEventListener("wheel", (event) => {
            const y = event.wheelDelta;
          
            if (!ticking) {
              window.requestAnimationFrame(() => {
                scroll(y);
                ticking = false;
              });
          
              ticking = true;
            }
          });
        document.addEventListener("mousedown", (ev) => {
            switch (ev.button) {
                case 0:
                    shift();
                    step(1);
                    break;
                case 1:
                    break;
                
            }
        })

        document.addEventListener("keydown", (ev) => {
			step(ev.keyCode);
        })
    }

    function loop() {
        const w = document.body.clientWidth;
        const h = document.body.clientHeight;
		const bw = w - (w % cz);
		const bh = h - (h % cz);
        if (bw != canvaselement.width || bh != canvaselement.height) {
            canvaselement.width = bw;
		    canvaselement.height = bh;
        }

        requestAnimationFrame(loop);
    }

    Inputs();
    loop();
    step();


    
    function genbitlevel(w, h, pixfunc) {
        if (vcanvas.width != w || vcanvas.height != h) {
            vcanvas.width = w;
            vcanvas.height = h;
        }

        var id = vctx.createImageData(w,h);
        const dlen = id.data.length / 4;
        for (let i = 0; i < dlen; i++) {
            const di = i * 4;
            const setr = (v) => { id.data[di] = v};
            const setg = (v) => { id.data[di + 1] = v};
            const b = id.data[di + 2];
            const a = id.data[di + 3];

            setr(pixfunc(i, w));
            
            setg(0);
        }

        id._width = w;
        id._height = h;

        return id;
    }
    
    function drawmap(key, imgkey = tilesetname) {
        const bitmap = bitmaps[key];
        const w = bitmap._width; 
        const h = bitmap._height; 
        
        const bw = canvaselement.width / cz;
        const bh = canvaselement.height / cz;
        const cox = Math.floor(bw * 0.5);
        const coy = Math.floor(bh * 0.5);
        const mox = Math.floor(w * 0.5);
        const moy = Math.floor(h * 0.5);


        const len = bitmap.data.length / 4;
        for (let i = 0; i < len; i++) {
            const di = i * 4;
            const r = bitmap.data[di];
            const g = bitmap.data[di + 1];
            const b = bitmap.data[di + 2];
            const a = bitmap.data[di + 3];

            const x = i % w;
            const y = Math.floor(i / w);

            drawtile(tiles[r], x + cox - mox, y + coy - moy, imgkey);
            //d(r, g, x + cox - mox, y + coy - moy);
            //drawtile("tilemap", tilename, x + cox - mox, y + coy - moy);
        }
    }
}



function _predraw(ctx) {
    ctx.msImageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;	
}

function onload() {
    return Promise.all(Array.from(document.images).map(img => {
        if (img.complete)
            return Promise.resolve(img.naturalHeight !== 0);
        return new Promise(resolve => {
            img.addEventListener('load', () => resolve(true));
            img.addEventListener('error', () => resolve(false));
        });
    })).then(results => {
        if (results.every(res => res))
            console.log('all images loaded successfully');
        else
            console.log('some images failed to load, all finished loading');
    });
}

onload().then(delay).then(loadingdone).then(main);

function delay() {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, 1000);
    })
}

function loadingdone() {
    const el = document.querySelector("#splashscreenloading");
    el?.classList.add("hidden");
}

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

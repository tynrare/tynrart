function makemappixel(index, w) {
    const x = index % w;
    const y = Math.floor(index / w);
    return (x + y % 2) % 2; // checkerboard
}

function main() {
    const vcanvas = document.querySelector("#vcanvas");
    const vctx = vcanvas?.getContext("2d") ?? null;
    const canvaselement = document.querySelector("#bitmap_canvas");
    const ctx = canvaselement.getContext("2d");

    const images = {};
    load();
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
    }

    let tilesetname = "tileset";
    
    function gettileset() {
        return images[tilesetname];
    }
    
    function gettilesetattribute(key) {
        return Number(gettileset().getAttribute(key) ?? 0);
    }

    const tw = 16;
    const twp = tw + 1;
    const cz = 64;
    const d = (sx, sy, wx, wy) => {
        ctx.drawImage(gettileset(), sx * (twp), sy * (twp), tw, tw, wx * cz, wy * cz, cz, cz);
    }

    function drawtile(index, x, y) {
        const w = gettilesetattribute("w") || 49;
        const l = gettilesetattribute("l") || 1078;


        const lax = index % l;
        const ax = lax % w;
        const ay = Math.floor(lax / w);

        _predraw(ctx);
        d(ax, ay, x, y);
    }

    let steps = 0;
    let stepx = 0;
    function step(d = 1) {
        // --- x 1
        const bw = Math.ceil(canvaselement.width / cz);
        const bh = Math.ceil(canvaselement.height / cz);
        const lbx = stepx % (bw * bh);
        const bx = lbx % bw;
        const by = Math.floor(lbx / bw);
        drawtile(steps, bx, by)

        // --- x 2

        if (vcanvas) {
            const s = bw < bh ? bw : bh;
            const sh = s - 2;
            drawmap(sh, sh);
        }
		
		steps = Math.max(steps + d, 0);
        stepx += 1;
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
            step(Math.sign(d));
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
                    step();
                    break;
                case 1:
                    break;
                
            }
        })

        document.addEventListener("keydown", () => {
			step();
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
    
    function drawmap(w, h) {
        if (vcanvas.width != w || vcanvas.height != h) {
            vcanvas.width = w;
            vcanvas.height = h;
        }

        var id = vctx.createImageData(w,h); // only do this once per page
        const dlen = id.data.length / 4;
        for (let i = 0; i < dlen; i++) {
            const di = i * 4;
            const setr = (v) => { id.data[di] = v};
            const setg = (v) => { id.data[di + 1] = v};
            const b = id.data[di + 2];
            const a = id.data[di + 3];

            setr(makemappixel(i, w))
            
            setg(0);
        }
        //vctx.putImageData( id, 0, 0 ); 

        //const bitmap = vctx.getImageData(0, 0, w, h);
        const bitmap = id;
        
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

            drawtile(r + steps, x + cox - mox, y + coy - moy);
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

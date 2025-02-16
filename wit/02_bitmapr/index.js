function main() {
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



    let steps = 0;
    function step() {
        const w = gettilesetattribute("w") || 49;
        const l = gettilesetattribute("l") || 1078;
        
        _predraw(ctx);

        const lax = steps % l;
        const ax = lax % w;
        const ay = Math.floor(lax / w);

        const bw = Math.ceil(canvaselement.width / cz);
        const bh = Math.ceil(canvaselement.height / cz);
        const lbx = steps % (bw * bh);
        const bx = lbx % bw;
        const by = Math.floor(lbx / bw);
        d(ax, ay, bx, by);
		
		steps += 1;
    }

    const tilesetoptions = ["tileset", "tileset1", "tileset2"];
    let tilesetshiftindex = 0;
    function shift() {
        tilesetshiftindex = (tilesetshiftindex + 1) % tilesetoptions.length;
        tilesetname = tilesetoptions[tilesetshiftindex];
        step();
    }

    function Inputs() {
        document.addEventListener("mousedown", () => {
            shift();
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
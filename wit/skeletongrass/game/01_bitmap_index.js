import { Config, CanvasApp } from "./01_bitmap_drawcore.js";
import { Loop } from "../src/loop.js";
import { onload } from "../src/onload.js"

var BLINE_T_X = 2;
var BLINE_T_Y = 2;

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

function main() {
    const canvaselement = document.querySelector("#bitmap_canvas");
    const configelement = document.querySelector("config");
    const config = new Config(configelement);
    const app = new CanvasApp(config);
    app.run(canvaselement);

    const tw = 16;
    const twp = tw + 1;
    const d = (sx, sy, wx, wy) => {
        const cz = app.get_cz();
        app.get_ctx().drawImage(app.get_image("tilemap"), sx * (twp), sy * (twp), tw, tw, wx * cz, wy * cz, cz, cz)
    }

    const draw = (dt = 0) => {
        const resized = app.resize();
        if (resized || dt == 0) {
            app.update(`level${config.get("level")}`);
            bline(1, 1, app.get_vpwidth() - 1, app.get_vpheight() - 1, (x, y) => d(BLINE_T_X, BLINE_T_Y, x, y));
        }
    };

    draw();

    const loop = new Loop(config, draw);
    loop.run();
}

onload().then(loadingdone).then(main);

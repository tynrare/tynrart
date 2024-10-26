
main();

async function main() {
    const flip = document.querySelector("bb#flip");
    const source = document.querySelector("db#source");
    const link = source.innerHTML + `?t=${Math.random()}`;
    const content = await fetch(link);
    flip.innerHTML = await content.text();

    fullscreen();
}

function fullscreen() {
    if (window.location.hash.includes("fullscreen")) {
        document.querySelector("#fullscreen")?.classList.add("fullscreen");
    }
}

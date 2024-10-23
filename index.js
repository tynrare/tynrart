
main();

async function main() {
    const flip = document.querySelector("bb#flip");
    const source = document.querySelector("db#source");
    const link = source.innerHTML + `?t=${Math.random()}`;
    const content = await fetch(link);
    flip.innerHTML = await content.text();
}

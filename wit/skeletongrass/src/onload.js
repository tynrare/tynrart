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

export default onload;
export { onload };
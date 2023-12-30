const Sketchpad = (() => {
    let currColor = "000000";
    let isDrawing = false;
    let drawSurface;
    let activePath;
    let pathCoords = new Map();
    
    function createDrawSurface(el) {
        if(!el) return;
        drawSurface = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        drawSurface.classList.add("sketchpad_drawSurface");
        drawSurface.setAttribute("width", "100%");
        drawSurface.setAttribute("height", "100%");
        el.appendChild(drawSurface);
    }

    function createPath() {
        let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("stroke", "#"+currColor);
        path.setAttribute("fill", "none");
        path.setAttribute("stroke-linecap", "round");
        path.setAttribute("stroke-linejoin", "round");
        path.setAttribute("stroke-width", "5");
        path.setAttribute("opacity", "0.75");
        path.classList.add("sketchpad_drawPath");
        return path;
    }

    function updatePath() {
        const path = activePath;
        let coords = [];
        if(pathCoords.size === 2) {
            let i = pathCoords.entries();
            const coords1 = i.next().value[1];
            const coords2 = i.next().value[1];
            coords = [...coords1,...[...coords2].reverse(), coords1[0]];
            path.setAttribute("fill", "#"+currColor);
        } else {
            pathCoords.forEach((value, key) => {
                coords = [...coords, ...value];
            });    
        }
        const drawPath = coords.reduce((acc, curr) => {
            return acc + ` L ${curr.x} ${curr.y}`;
        }, `M ${coords[0].x} ${coords[0].y}`);
        path.setAttribute("d", drawPath);
    }
        
    function startDrawing(event) {
        isDrawing = true;
        pathCoords.set(event.pointerId, [{x: event.clientX, y: event.clientY}]);
        if(pathCoords.size === 1) {
            activePath = createPath();
            drawSurface.appendChild(activePath);
        }
        updatePath();
    }
    
    function draw(event) {
        if (!isDrawing) return;
        pathCoords.set(event.pointerId, [...pathCoords.get(event.pointerId), {x: event.clientX, y: event.clientY}]);
        updatePath();
    }
    
    function endDrawing(event) {
        isDrawing = false;
        activePath = undefined;
        pathCoords.clear();
    }
        
    function undo() {
        let paths = Array.from(drawSurface.getElementsByClassName("sketchpad_drawPath"));
        if (paths.length > 0) {
            let lastPath = paths.pop();
            lastPath.parentNode.removeChild(lastPath);
        }
    }

    function clear() {
        drawSurface.innerHTML = "";
    }
    
    function setColor(color) {
        currColor = color;
    }

    function loadCSS(path) {
        const oldLink = document.querySelector(`link[href="${path}"]`);
        if(oldLink) oldLink.parentNode.removeChild(oldLink);

        const cssLink = document.createElement("link");
        cssLink.rel = "stylesheet";
        cssLink.href = path + '?' + new Date().getTime();
        document.head.appendChild(cssLink);
    }

    function handlePointerDown(event) {
        event.preventDefault();
        startDrawing(event);
    }

    function handlePointerMove(event) {
        draw(event);
    }

    function handlePointerUp(event) {
        endDrawing(event);
    }

    function init(el) {
        if(!el) return;
        loadCSS("./sketchpad/style.css");
        el.style.position = "relative";
        el.style.display = "flex";
        createDrawSurface(el);
        el.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("pointermove", handlePointerMove);
        document.addEventListener("pointerup", handlePointerUp);
    }

    function download() {
        const svg = formatSvg(drawSurface.innerHTML);
        let parser = new DOMParser();
        let blob = new Blob([svg], {type: "image/svg+xml;charset=utf-8"});
        triggerDownload(URL.createObjectURL(blob));
    }

    function formatSvg(rawData) {
        return `<svg xmlns="http://www.w3.org/2000/svg" version="1.1">${rawData}</svg>`;
    }

    function triggerDownload(dataUrl) {
        let downloadLink = document.createElement("a");
        downloadLink.href = dataUrl;
        downloadLink.download = `sketchpad-${new Date().getTime()}.svg`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }

    function rgbToHex(rgb) {
        const [r, g, b] = rgb;
        const hex = ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
        return `${hex}`;
    }

    function getRandomColor() {
        return new Promise((resolve, reject) => {
            const rgb = [Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)];
            resolve(rgbToHex(rgb));
        })
    }

    async function getRandomPalette() {
        return new Promise((resolve, reject) => {
            let colors = [];
            let colorCount = 0;
            let interval = setInterval(() => {
                if(colorCount >= 5) {
                    clearInterval(interval);
                    resolve(colors);
                } else {
                    getRandomColor().then(color => {
                        colors.push(color);
                        colorCount++;
                    })
                }
            }, 0);
        })
        // const response = await fetch('http://colormind.io/api/', {
        //     method: 'POST',
        //     body: JSON.stringify({
        //         model: "default",
        //     })
        // });
    
        // const data = await response.json();
        // return data.result.map(rgb => rgbToHex(rgb));
    }

    // async function getRandomPalette() {
    //     const response = await fetch(`http://www.thecolorapi.com/scheme?hex=${getRandomColor()}&mode=analogic`);
    //     const data = await response.json();
    //     return data.colors.map(color => color.hex.value);
    // }

    function debug(message) {
        document.getElementById("debug").innerHTML = message;
    }

    return {
        init: init,
        undo: undo,
        setColor: setColor,
        clear: clear,
        download: download,
        getRandomPalette: getRandomPalette
    }

})();

export default Sketchpad;

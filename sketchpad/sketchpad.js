const Sketchpad = (() => {
    let currPath;
    let currColor = "black";
    let isDrawing = false;
    let pathData = "";
    let drawSurface;
    
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
        path.setAttribute("stroke", currColor);
        path.setAttribute("fill", "none");
        path.setAttribute("stroke-linecap", "round");
        path.setAttribute("stroke-linejoin", "round");
        path.setAttribute("stroke-width", "5");
        path.classList.add("sketchpad_drawPath");
        return path;
    }
        
    function startDrawing(event) {
        isDrawing = true;
        currPath = createPath();
        drawSurface.appendChild(currPath);  
        pathData = `M ${event.clientX} ${event.clientY}`;
    }
    
    function draw(event) {
      if (!isDrawing) return;
      pathData += ` L ${event.clientX} ${event.clientY}`;
      currPath.setAttribute("d", pathData);
    }
    
    function endDrawing() {
      isDrawing = false;
      currPath = undefined;
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

    function init(containerEl) {
        if(!containerEl) return;
        loadCSS("./sketchpad/style.css");
        containerEl.style.position = "relative";
        containerEl.style.display = "flex";
        createDrawSurface(containerEl);
        containerEl.addEventListener("pointerdown", startDrawing);
        document.addEventListener("pointermove", draw);
        document.addEventListener("pointerup", endDrawing);
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

    return {
        init: init,
        undo: undo,
        setColor: setColor,
        clear: clear,
        download: download
    }

})();

export default Sketchpad;

const Sketchpad = (() => {
    let currPath;
    let currColor = "black";
    let palette = ["black", "red", "blue", "green", "magenta", "purple", "orange"];
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
        path.classList.add("drawPath");
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
    
    function selectColor(color) {
        currColor = color;
        let selectedItem = document.querySelector(`.sketchpad_colorPickerItem.selected`);
        if(selectedItem) selectedItem.classList.remove("selected");
        let newSelectedItem = document.querySelector(`.sketchpad_colorPickerItem[data-color=${color}]`);
        newSelectedItem.classList.add("selected");
    }
    
    function createColorPickerItem(color) {
        let button = document.createElement("button");
        button.dataset.color = color;
        button.style.backgroundColor = color;
        button.classList.add("sketchpad_colorPickerItem");
        button.addEventListener("click", e => selectColor(color));
        return button;
    }
    
    function populateColorPicker(el) {
        const picker = document.createElement("div");
        picker.classList.add("sketchpad_colorPicker");
        el.appendChild(picker);
        palette.forEach(color => {
            picker.appendChild(createColorPickerItem(color))
        })
        selectColor(currColor);
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
        populateColorPicker(containerEl);
    }

    return {
        init: init,
        undo: undo
    }

})();

export default Sketchpad;

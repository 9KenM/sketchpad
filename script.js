import Sketchpad from './sketchpad/sketchpad.js';

function selectColor(color) {
    let selectedItem = document.querySelector(`.colorPickerItem.selected`);
    if(selectedItem) selectedItem.classList.remove("selected");
    let newSelectedItem = document.querySelector(`.colorPickerItem[data-color="${color}"]`);
    newSelectedItem.classList.add("selected");
    Sketchpad.setColor(color);
}

function createColorPickerItem(color) {
    let button = document.createElement("button");
    button.dataset.color = color;
    button.style.backgroundColor = "#"+color;
    button.classList.add("colorPickerItem");
    button.addEventListener("click", e => selectColor(color));
    return button;
}

function initColorPicker(palette) {
    const picker = document.getElementsByClassName("colorPicker")[0];
    palette.forEach(color => {
        picker.appendChild(createColorPickerItem(color))
    })
    selectColor(palette[0]);
}

function initControls() {
    const clearButton = document.getElementById("clearButton");
    const undoButton = document.getElementById("undoButton");
    const downloadButton = document.getElementById("downloadButton");
    clearButton.addEventListener("click", Sketchpad.clear);
    undoButton.addEventListener("click", Sketchpad.undo);
    downloadButton.addEventListener("click", Sketchpad.download);
}

function init() {
    Sketchpad.init(document.getElementById("sketchpad"));
    Sketchpad.getRandomPalette().then(res => {
        initColorPicker(['000000', ...res]);
    })
    initControls();
}

document.addEventListener("DOMContentLoaded", init);
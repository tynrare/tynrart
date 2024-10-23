var palette = null;
var textarea = null;
main_avessy();

function main_avessy() {
  window.addEventListener("keypress", onkeypress);
  window.addEventListener("click", _onclick);
  window.addEventListener("paste", _onpaste);
  textarea = document.querySelector("bb#main text");
}

function onkeypress(keyboardEvent) {
  switch (keyboardEvent.key) {
    case "Enter":
      if (keyboardEvent.ctrlKey) {
        resetInput();
      }

      if (keyboardEvent.shiftKey) {
        muteText();
      }

      insertNewLine();
      randomizePallete();
      break;

    default:
      insertText(keyboardEvent.key);
      break;
  }
}

function getActiveInput() {
  var c = textarea.children;
  var input = c[c.length - 2]; // last on is a brick element

  return input;
}

function insertText(text) {
  getActiveInput().innerHTML += text;
}

function muteText() {
  getActiveInput().classList.add("mute");
}

function insertNewLine() {
  var active = getActiveInput();

  if (active) {
    active.innerHTML = md.render(active.innerHTML);
  }

  var el = document.createElement("p");
  textarea.appendChild(el);
  var bar = textarea.querySelector("b");

  if (bar) {
    bar.parentElement.removeChild(bar);
    textarea.appendChild(bar);
  } else {
    textarea.innerHTML += "<b>▮</b>";
  }
}

function resetInput() {
  textarea.innerHTML = "";
}


function _onpaste(event) {
  var paste = (event.clipboardData || window.clipboardData).getData("text");

  if (!paste.length) {
    insertText("🍍");
    return;
  }

  insertText(paste);
}

function _onclick() {
  randomizePallete();
}

function _loadPalette() {
  palette = document.querySelector("db#palette").innerHTML;
  palette = palette.split(" "); // Array[32]. Palette from https://lospec.com/palette-list/pineapple-32
}

function randomizePallete() {
  if (!palette) {
    _loadPalette();
  }

  var colors = palette.length;
  var colorA = Math.round(Math.random() * colors);
  var colorB = Math.round(Math.random() * colors);

  if (colorA == colorB) {
    randomizePallete();
    return;
  }

  document.body.style.setProperty("--color-a", "#" + palette[colorA]);
  document.body.style.setProperty("--color-b", "#" + palette[colorB]);
}

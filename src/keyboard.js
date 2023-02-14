
let counter;
let count = 0;

/*
 * TODO: Implement a method of tracking if key action is currently being executed, if key is still pressed after it executes
 * then repeat the action, else stop the action.
 * 
 * Status: UNCOMPLETE.
 */

function KeyStart() {
    counter = setInterval(function() {
        count++;
    }, 500);
}

function KeyEnd() {
    clearInterval(counter);
}

//TODO: Update to use ctrl+{key} inputs only.

function KeyDown(event) {
    //document.getElementById(`last-keypress`).innerText = event.key + " Pressed";

    let button = document.getElementById(`kb-${event.key}`);
    button.style = "background-color: var(--btn-kb-active);";
    //TODO: Start button held action. Will need something like KeyStart above.
    button.click();
}

function KeyUp(event) {
    //document.getElementById(`last-keypress`).innerText = event.key + " Released";

    let button = document.getElementById(`kb-${event.key}`);
    button.style = 'none'
    //TODO: Stop button held action. Will need something like KeyStop above.
    button.click();
}

window.addEventListener('keydown', KeyDown, true);
window.addEventListener('keyup', KeyUp, true);
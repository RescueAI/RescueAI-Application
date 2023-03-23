

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

let key_active = false; //Stops button presses from "repeating" while being held down.

function KeyDown(event) {
    //document.getElementById(`last-keypress`).innerText = event.key + " Pressed";

    let button = document.getElementById(`kb-${event.key}`);
    
    //TODO: Start button held action. Will need something like KeyStart above.
    if(!key_active && button !== null)
    {
        button.style = "background-color: var(--btn-kb-active);";
        key_active = true;
        button.click();
    }
}

function KeyUp(event) {
    //document.getElementById(`last-keypress`).innerText = event.key + " Released";
    key_active = false;

    let button = document.getElementById(`kb-${event.key}`);

    if(button !== null)
    {
        hover();
        button.style = 'none'
        //TODO: Stop button held action. Will need something like KeyStop above.
    }

}

window.addEventListener('keydown', KeyDown, true);
window.addEventListener('keyup', KeyUp, true);


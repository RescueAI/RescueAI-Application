

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

let key_active = false; //Stops button presses from "repeating" while being held down.

function KeyDown(event) {

    //TODO: Only capture keys if control key is held. (else return void) (Check if this code works)
    //if(event.ctrlKey && (event.key === 'w' || event.key === 'a' || event.key === 's' || event.key === 'd'))
    //{
    //    event.preventDefault();
    //}
    
    //if (!event.ctrlKey) {
        
    //    return;
    //}

    let button = document.getElementById(`kb-${event.key}`);

    if(!key_active && button !== null)
    {

        button.style = "background-color: var(--btn-kb-active);";
        button.click();
    }
}

function KeyUp(event) {

    key_active = false;

    let button = document.getElementById(`kb-${event.key}`);

    if(button !== null)
    {
        hover();
        button.style = 'none'
        key_flag = false;
    }

}

window.addEventListener('keydown', KeyDown, true);
window.addEventListener('keyup', KeyUp, true);


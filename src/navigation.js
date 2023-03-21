    function navigation() {
        console.log("Navigation Function Loaded");
    }

    function test() {
        alert("Test Function Loaded");
    }

    function print() {
        alert("Print Function Loaded");
    }

    function move_forward() {
        document.getElementById(`last-keypress`).innerText = "[Navigation]: Move Forward Event Pressed";
        //TODO: Send drone command.

        
        //TODO: Send command to command log history (pass or fail)
    }

    function move_backward() {
        document.getElementById(`last-keypress`).innerText = "[Navigation]: Move Backward Event Pressed";

        //TODO: Send drone command.

        
        //TODO: Send command to command log history (pass or fail)
    }

    function move_left() {
        document.getElementById(`last-keypress`).innerText = "[Navigation]: Move Left Event Pressed";

        //TODO: Send drone command.

        
        //TODO: Send command to command log history (pass or fail)
    }

    function move_right() {
        document.getElementById(`last-keypress`).innerText = "[Navigation]: Move Right Event Pressed";

        //TODO: Send drone command.

        
        //TODO: Send command to command log history (pass or fail)
    }

    function ascend() {
        document.getElementById(`last-keypress`).innerText = "[Navigation]: Ascend Event Pressed";

        //TODO: Send drone command.

        
        //TODO: Send command to command log history element (pass or fail)
    }

    function descend() {
        document.getElementById(`last-keypress`).innerText = "[Navigation]: Descend Event Pressed";

        //TODO: Send drone command.

        
        //TODO: Send command to command log history (pass or fail)
    }

    function rot_left() {
        document.getElementById(`last-keypress`).innerText = "[Navigation]: Turn Left Event Pressed";

        //TODO: Send drone command.


        //TODO: Send command to command log history (pass or fail)
    }

    function rot_right() {
        document.getElementById(`last-keypress`).innerText = "[Navigation]: Turn Right Event Pressed";
    }
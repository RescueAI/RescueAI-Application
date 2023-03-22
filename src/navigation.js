    function navigation() {
        console.log("Navigation Function Loaded");
    }

    function test() {
        alert("Test Function Loaded");
    }

    function print() {
        alert("Print Function Loaded");
    }
    function addCommandLog(data)
    {
        let table = document.getElementById("command-log-table");
        let rowCount = table.rows.length;
        var row = table.insertRow(rowCount);

        let msg = row.insertCell(0)
        msg.className="alert-log"
        msg.innerHTML= data.message;

        row.insertCell(1).innerHTML= data.timestamp;
        row.insertCell(2).innerHTML= data.localtime;
    }

    async function move_command(command, message) {
        // Send drone command.
        let message_out = "User Action: " + message + ": ";
        let status;
        console.log("command request start: ", command);
   
        
            const response = await fetch(`http://localhost:6969/api/drone/move/${command}`, {
                method: 'POST',
                headers: {
                    'Content-Type':'application/json'
                }
        })

        if (response.ok) {
              console.log(`${command} command sent successfully`);
              // Send command to command log history (pass or fail)
              //fetch('/api/command-log', { method: 'POST', body: { command, status: 'pass' } });
              status = "PASSED";
            } else {
              console.log(`Failed to send ${command} command`);
              // Send command to command log history (pass or fail)
              //fetch('/api/command-log', { method: 'POST', body: { command, status: 'fail' } });
              status = "FAILED";
            }

            today = new Date();
            var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

            message_out += status

            data = {message:message_out, timestamp:time, localtime:time}
            addCommandLog(data);
            console.log("command request end: ", command)
    }

    function hover() {
        move_command('hover', 'Hover Command Issued');
        console.log("Hover called")
    }

    function land() {
        move_command('land', 'Land Command Issued');
        console.log("Land called")
    }

    function takeoff() {
        move_command('takeoff', 'Takeoff Command Issued');
        console.log("Takeoff called")
    }

    function move_forward() {
        move_command('forward', 'Forward Command Issued');
    }
    
    function move_backward() {
        move_command('backward', 'Backward Command Issued');
    }
    
    function move_left() {
        move_command('left', 'Left Command Issued');
    }
    
    function move_right() {
        move_command('right', 'Rigth Command Issued');
    }
    
    function ascend() {
        move_command('up', 'Ascend Command Issued');
    }
    
    function descend() {
        move_command('down', 'Descend Command Issued');
    }
    
    function rot_left() {
        move_command('rotate-left', 'Rotate Left Command Issued');
    }
    
    function rot_right() {
        move_command('rotate-right', 'Rotate Right Command Issued');
    }
    
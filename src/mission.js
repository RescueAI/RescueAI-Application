
const restraint = {
    commands: ["forward","backward", "left", "right", "ascend", "descend", "rotate-left", "rotate-right"], 
    s_min: 0, 
    s_max: 20,
    s_default:1, 
    d_min: 0, 
    d_max: 20,
    d_default:1
};
//TODO load missions if they exist,

let MISSION_LIST;
let ACTIVE_MISSION;

//Call this function after certain actions to update UI
async function load_missions()
{
    try 
    {
        let missions = await mission_get();
        for(let i = 0; i < missions.length; i++)
        {
            addMission(missions[i]);
        }
        MISSION_LIST = missions;
    }
    catch (error)
    {
        console.error(`Error: ${error}`);
    }


}

/**
 * Function to be attached to mission cards onclick event 
 * at time of card generation in addMission(mission)
 * @param {*} id 
 */
function select_mission(id)
{
    for(let i = 0; i < MISSION_LIST.length; i++)
    {
        if(MISSION_LIST[i].id === id)
        {
            load_mission_context(MISSION_LIST[i]);
        }
    }
}

function load_mission_context(mission)
{
    ACTIVE_MISSION = mission;

    //TODO: Load mission context into mission builder

}




function mission_new()
{
    //TODO: Add mission card
    config = document.getElementById('mission-instructions');

}

function mission_edit()
{
    //TODO: Get selected mission's id.
    console.log(MISSION_LIST[0])
    //TODO: Find mission id in the mission set

}

function mission_delete()
{

}

//Call to add a new mission instruction to the current mission
function mission_add_instruction()
{

    let table = document.getElementById('mission-instruction-table');
    let rowCount = table.rows.length; //This'll be the ID difference for everything.
    console.log("B:"+rowCount);
    //TODO: Generate row element with inputs.
    let row = table.insertRow();
    row.id = `msn-c-${rowCount}`;

    //TODO: Set scroll position


    let c_cell = row.insertCell(0);     //Command_cell
    let select_c = document.createElement('select');
    select_c.name = "Select Command";
    select_c.id = `msn-c_cmd-${rowCount}`;

    let options = restraint.commands;

    for(let i = 0; i < options.length; i++)
    {
        let option = document.createElement("option");
        option.value = options[i];
        option.text = options[i];
        select_c.appendChild(option);
    }

    c_cell.appendChild(select_c);

    let s_cell = row.insertCell(1);     //speed_cell
    let input_s = document.createElement('input');
    input_s.id = `msn-c_spd-${rowCount}`;
    input_s.type = "number";
    input_s.min = restraint.s_min;
    input_s.max = restraint.s_max; //TODO: Fix this!
    input_s.value = restraint.s_default;
    input_s.name = "Speed";

    console.log(input_s);

    s_cell.appendChild(input_s);

    let d_cell = row.insertCell(2);     //speed_cell
    let input_d = document.createElement('input');
    input_d.id = `msn-c_drn-${rowCount}`;
    input_d.type = "number";
    input_d.min = restraint.d_min;
    input_d.max = restraint.d_max; //TODO: Fix this!
    input_d.value = restraint.d_default;
    input_d.name = "Duration";

    console.log(input_d);

    d_cell.appendChild(input_d);
}

//Removes last instruction from the table.
function mission_remove_instruction()
{
    let table = document.getElementById('mission-instruction-table');
    let rowCount = table.rows.length; //This'll be the ID difference for everything.

    //TODO: Generate row element with inputs.
    if(rowCount>1){table.deleteRow(rowCount-1)}
    else
    {
        console.error("Mission builder is unable to delete any more instructions\n");
    }
}

//Call to load an instruction to the mission builder from a preexisting instruction
//i.e from json.
function mission_load_instruction(instruction)
{

    let table = document.getElementById('mission-instruction-table');
    let rowCount = table.rows.length; //This'll be the ID difference for everything.

    const options = restraint.commands;

    if(!mission_validate_instruction(instruction))
    {
        console.log("valid instruction parameters for numbers are all set to 1. Please see mission_load_instruction function")
        console.error("Invalid instruction data attempted to be loaded in mission builder\n");
        return NULL;
    }
    
    //TODO: Generate row element with inputs.
    let row = table.insertRow();
    row.id = `msn-c-${rowCount}`;

    let c_cell = row.insertCell(0);     //Command_cell
    let select_c = document.createElement('select');
    select_c.required = true;
    select_c.name = "Select Command";
    select_c.id = `msn-c_cmd-${rowCount}`;
   
    for(let i = 0; i < options.length; i++)
    {
        let option = document.createElement("option");
        option.value = options[i];
        option.text = options[i];
        select_c.appendChild(option);
    }

    select_c.value = instruction.command;

    c_cell.appendChild(select_c);

    let s_cell = row.insertCell(1);     //speed_cell
    let input_s = document.createElement('input');
    input_s.required = true;
    input_s.id = `msn-c_spd-${rowCount}`;
    input_s.type = "number";
    input_s.min = restraint.s_min;
    input_s.max = restraint.s_max; //TODO: Fix this!
    input_s.value = instruction.speed;
    input_s.name = "Speed";

    s_cell.appendChild(input_s);

    let d_cell = row.insertCell(2);     //speed_cell
    let input_d = document.createElement('input');
    input_d.required
    input_d.id = `msn-c_drn-${rowCount}`;
    input_d.type = "number";
    input_d.min = restraint.d_min;
    input_d.max = restraint.d_max; //TODO: Fix this!
    input_d.value = instruction.duration;
    input_d.name = "Duration";

    d_cell.appendChild(input_d);
}


function mission_validate_instruction(instruction)
{
    let commandValid = restraint.commands.includes(instruction.command);
    let speedValid = (typeof instruction.speed == "number") && instruction.speed >= restraint.s_min && instruction.speed <= restraint.s_max;
    let durationValid = (typeof instruction.duration == "number") && instruction.duration >= restraint.d_min && instruction.duration <= restraint.d_max;

    let success = commandValid && speedValid && durationValid;

    if(!success)
    {
        console.error("Parse mission builder instruction NOT valid");
    }
    else
    {
        console.log("Parsed mission builder instruction is valid");
    }

    return commandValid && speedValid && durationValid;
}

function getRowInstruction(rowNumber)
{

    let commandSelect = document.getElementById(`msn-c_cmd-${rowNumber}`);
    let speedInput  = document.getElementById(`msn-c_spd-${rowNumber}`);
    let durationInput  = document.getElementById(`msn-c_drn-${rowNumber}`);

    let instruction = {
        command:  commandSelect.value,
        speed:    parseInt(speedInput.value),
        duration: parseInt(durationInput.value)
    };

    console.log("Retreived Instructions from Row " + rowNumber + " | object:" + instruction);

    if(mission_validate_instruction(instruction))
    {
        return instruction;
    }
    else
    {
        console.error("Invalid instruction detected. Defaulting to hover.");

        return {
            command: "hover",
            speed: 1,
            duration: 20
        }
    }
}

function getInstructionList()
{
    let table = document.getElementById('mission-instruction-table');
    let rowCount = table.rows.length; //This'll be the ID difference for everything.
    
    let instruct_list = [rowCount-1]; //minus 1 to account for column header row.

    for(i = 1; i< rowCount; i++)
    {
        instruct_list[i] = getRowInstruction(i);
    }

    console.log("Instuction List Object: " + JSON.stringify(instruct_list));

    return instruct_list;
}




function mission_save()
{


    //TODO: Check if mission already saved -> do nothing
    let old = mission_get();

    //TODO: Compare with local mission set.




    //TODO: Else check if mission to be saved already exists on file -> update file.

    //TODO: Else make a new file.

    let data = getInstructionList();



    let missions = mission_get();
    mission_post(missions);
    console.log(missions);
}

function mission_reset()
{
    //TODO: Load inputs to original state. (Reload previous json file loaded, or load new table)
    load_missions();
}

function mission_post(data)
{
    fetch('http://localhost:6969/post_missions', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type':'application/json'
        }
    }).then(response => {
        if(response.ok) 
        {
            console.log("Mission data saved successfully")
        }
        else 
        {
            console.log("Error:", response.statusText);
        }
    }).catch(error => {
        console.error('Error:', error);
    })
}

function mission_get()
{
    return fetch('http://localhost:6969/get_missions')
    .then(response => {
        if(response.ok)
        {
            return response.json();
        }
        else
        {
            console.error("Error:", response.statusText);
        }

    }).then(data => {
        console.log("Mission data:", data);
        return data;
    }).catch(error => {
        console.error("Error", error);
        throw error
    })
}

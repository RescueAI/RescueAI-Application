
const restraint = {
    commands: ["forward","backward", "left", "right", "ascend", "descend", "rotate-left", "rotate-right", "hover"], 
    s_min: 0, 
    s_max: 20,
    s_default:1, 
    d_min: 0, 
    d_max: 20,
    d_default:1
};
//TODO load missions if they exist,

let MISSION_LIST = [];
let ACTIVE_MISSION;

window.onload = function() {
    load_missions(false);
}

function addMission(mission)
{
    let container = document.getElementById("m-select");

    let card = document.createElement('button');
    card.className = "mission-card";
    card.id = `m-card-mission-${mission.id}`
    card.innerHTML = `<h3>${mission.name}</h3>`//"Mission Card";
    card.onclick = () => {select_mission(mission.id)};

    container.appendChild(card);
}

function addNewMission() {
    let container = document.getElementById("m-select");
    let card = document.createElement('button');
    let id = generateID();
  
    card.className = "mission-card";
    card.id = `m-card-mission-${id}`;
    card.innerHTML = `<h3>New Mission</h3>`; //"Mission Card";
    card.onclick = () => { select_mission(id) };
  
    container.appendChild(card);
  
    //let mission = { id: id, name: "", instructions: [] };


    // Activates select_mission which will make it the active mission and bring up configuration context
    //card.click();
  
    return { id: id, name: "", instructions: [] };
}

function generateID()
{
    let maxID = 0;
    for(let i = 0; i < MISSION_LIST.length; i++)
    {
        let currID = MISSION_LIST[i].id;
        if( currID > maxID)
        {
            maxID = currID;
        }
    }

    return maxID+1;
}

//Call this function after certain actions to update UI
async function load_missions(reload)
{
    try 
    {
        let missions;

        if(!reload){
            //Load missions only if MISSION_LIST is NULL
            missions = await mission_get(MISSION_LIST);
            //TODO: Replace missions in UI
        }
        else
        {
            //Load general saved missions regardless of content.
            missions = await mission_get(null);
            //TODO: Replace missions in UI
        }

        MISSION_LIST = missions;

        for(let i = 0; i < missions.length; i++)
        {
            addMission(missions[i]);
        }
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
        let card = document.getElementById(`m-card-mission-${MISSION_LIST[i].id}`);

        if(MISSION_LIST[i].id == id)
        {
            card.style = "background-color: var(--btn-kb-active); border:none";
            card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            load_mission_context(MISSION_LIST[i]);
            document.getElementById("mission-name").disabled = false; //Allow user to enter a name in field
            //now that something is selected.
        }
        else
        {
            card.style = 'none';
        }
    }
}

function is_active(mission)
{
    return (mission?.id === ACTIVE_MISSION?.id)
}

function load_mission_context(mission)
{
    console.log(JSON.stringify(mission))
    if(!is_active(mission))
    {
        ACTIVE_MISSION = mission;

        console.log("ACTIVE MISSION SET TO:" + JSON.stringify(ACTIVE_MISSION));
    
        mission_clear_instructions();
        let instrucs = mission.instructions;
    
        for(i = 0; i<instrucs.length; i++)
        {
            mission_load_instruction(instrucs[i])
        }

        let input_name = document.getElementById("mission-name");
        input_name.value = mission.name;
    }
}

function mission_clear_instructions()
{
    let table = document.getElementById('mission-instruction-table');
    let rowCount = table.rows.length;

    for(i=rowCount-1; i>0; i--)
    {
        table.deleteRow(i);
    }
}

function mission_new()
{
    //TODO: Add mission card


    mission_clear_instructions();

    let mission = addNewMission();

    MISSION_LIST.push(mission);
    let card = document.getElementById(`m-card-mission-${mission.id}`)
    card.click();

    console.log("ATTEMPT TO CLEAR");

}

function mission_edit()
{

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

    let c_cell = row.insertCell(0);     //Command_cell
    let select_c = document.createElement('select');
    select_c.name = "Select Command";
    select_c.id = `msn-c_cmd-${rowCount}`;
    select_c.className = "primary-input"

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
    input_s.className = "primary-input"

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
    input_d.className = "primary-input"

    console.log(input_d);

    d_cell.appendChild(input_d);
    
    row.scrollIntoView({ behavior: 'smooth', block: 'end' });
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
        console.log("valid instruction parameters for numbers are all set to 1. Please mission_load_instruction function")
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
    select_c.className = "primary-input"
   
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
    input_s.className = "primary-input"
    

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
    input_d.className = "primary-input"

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
    
    let instruct_list = []; //minus 1 to account for column header row.

    for(i = 1; i< rowCount; i++)
    {
        instruct_list.push(getRowInstruction(i));
    }

    console.log("Instuction List Object: " + JSON.stringify(instruct_list));

    return instruct_list;
}

function mission_save()
{
    ACTIVE_MISSION.instructions = getInstructionList();

    let input_name = document.getElementById("mission-name");
    console.log("SAFE"+input_name.value);

    ACTIVE_MISSION.name = input_name.value;

    for(i = 0; i<MISSION_LIST.length; i++)
    {
        if(MISSION_LIST[i].id === ACTIVE_MISSION.id)
        {
            MISSION_LIST[i] = ACTIVE_MISSION;
        }
    }

    MISSION_LIST = MISSION_LIST.filter(mission => mission['name'] !== "");
    MISSION_LIST = MISSION_LIST.filter(mission => mission['instructions'] !== []);
    //TODO: Clear grid
    //TODO: Respawn grid

    mission_post(MISSION_LIST);
}

function mission_reset()
{
    //TODO: Load inputs to original state. (Reload previous json file loaded, or load new table)
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

function mission_get(LocalMissions)
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

        //Ensure we don't replace unsaved data. 
        if(LocalMissions && JSON.stringify(data) === JSON.stringify(LocalMissions))
        {
            return LocalMissions;
        }
        else
        {
            return data;
        }

    }).catch(error => {
        console.error("Error", error);
        throw error
    })
}


function mission_start()
{
    let id = ACTIVE_MISSION?.id;
    if(id)
    {
        const options = {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            }
          };
          fetch(`http://localhost:6969/api/drone/start/${id}`, options)
            .then(response => {
              if (response.ok) {
                console.log('Mission started successfully');
              } else {
                console.error(`Error starting mission: ${response.statusText}`);
              }
            })
            .catch(error => console.error(`Error starting mission: ${error.message}`));
    }
    else
    {
        console.error("No mission ID found");
    }
}

function mission_stop()
{
    const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      };
      fetch(`http://localhost:6969/api/drone/stop`, options)
        .then(response => {
          if (response.ok) {
            console.log('Mission ended successfully');
          } else {
            console.error(`Error ending mission: ${response.statusText}`);
          }
        })
        .catch(error => console.error(`Error ending mission: ${error.message}`));
    }
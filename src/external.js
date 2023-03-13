document.getElementById("kb-w").onclick = () => {
    testAdd();
  };



function clicked(button, implemented) {
    alert("Interface Script Loaded: Clicked "+ button+ " button ("+ implemented+ ")");
}



function addTableRow(id) {
    table = document.getElementById(id)
}

function testAdd()
{
    console.log("PRINT");

    let data = {
        "command":"WOW",
        "timestamp":"01:102:2",
        "runtime":"01:102:3"
    }

    let ob = JSON.parse(data);

    addCommandLog(ob);
}

function addCommandLog(data)
{
    let table = document.getElementById("command-log-table");
    let rowCount = table.rows.length;
    var row = table.insertRow(rowCount);
    row.insertCell(0).innerHTML= data.command;
    row.insertCell(1).innerHTML= data.timestamp;
    row.insertCell(2).innerHTML= data.runtime;
}
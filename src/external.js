document.getElementById("kb-w").onclick = () => {
    testAdd();
};

function clicked(button, implemented) {
    alert("Interface Script Loaded: Clicked "+ button+ " button ("+ implemented+ ")");
}

function testAdd()
{
    let data = {
        "message":"WOW",
        "timestamp":"01:102:2",
        "localtime":"01:102:3"
    }

    addCommandLog({"message":"User Action - Forward", "timestamp":"01:20:10", "localtime":"01:32:23"});
    addEventLog({"message":"Alert-Test", "timestamp":"01:20:10", "localtime":"01:32:23", "thumbnail":"https://thumbs.dreamstime.com/b/person-gray-photo-placeholder-man-shirt-white-background-person-gray-photo-placeholder-man-132818487.jpg"})
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

function addEventLog(data)
{
    let table = document.getElementById("event-log-table");
    let rowCount = table.rows.length;

    let row = table.insertRow(1);
    row.id = `event-row-${rowCount}`;

    let msg = row.insertCell(0)
    msg.className="alert-log"
    msg.innerHTML= data.message;

    row.insertCell(1).innerHTML= data.timestamp;
    row.insertCell(2).innerHTML= data.localtime;
 
    let imgCell =  row.insertCell(3);
    
    let imgDiv = document.createElement('div');
    imgDiv.className="event-img-container"
    imgCell.appendChild(imgDiv);

    let image = document.createElement('img');
    image.src = data.thumbnail;
    image.className = "event-img"

    imgDiv.appendChild(image);

    let btnCell = row.insertCell(4);
    btnCell.id = `event-btn-cell-${rowCount}`;
    
    //Create div where confirm/decline buttons will go.
    let btnDiv = document.createElement('div');
    btnDiv.id = `event-btn-div-${rowCount}`;
    btnDiv.className="event-btn-container"
    //Append div to the cell
    btnCell.appendChild(btnDiv);

    let btnAccept = document.createElement('button');
    btnAccept.className = "primary-btn btn-accept event-btn noselect";
    btnAccept.innerHTML = "✓";
    btnAccept.onclick = () => { event_accept(row.id); }
    btnDiv.appendChild(btnAccept);
    
    let btnDecline = document.createElement('button');
    btnDecline.className = "primary-btn btn-decline event-btn noselect";
    btnDecline.innerHTML = "✕";
    btnDecline.onclick = () => { event_decline(row.id); }
    btnDiv.appendChild(btnDecline);

}

function event_accept(row_id)
{
    let row = document.getElementById(row_id);
    row.style = "border: 2px solid blue";
}

function event_decline(row_id)
{
    //TODO: Manage Files.

    //document.getElementById("event-log-table").deleteRow(rowCount);

    let row = document.getElementById(row_id);
    
    console.log(`Deleting Event: ${row_id}`);
    document.getElementById("event-log-table").deleteRow(row.rowIndex);
}
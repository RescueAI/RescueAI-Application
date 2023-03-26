const fs = require('fs');

function routine_takeoff(client) {
	client.takeoff();
}

function routine_land(client) {
	client.land();
}

function move_forward(client) {
	client.front(1);
}

function move_backward(client) {
	client.back(1);
}

function move_left(client) {
	client.left(1);
}

function move_right(client) {
	client.right(1);
}

function move_ascend(client) {
	client.up(1);
}

function move_descend(client) {
	client.down(1);
}

function move_rotate_left(client) {
	client.counterClockwise(1);
}

function move_rotate_right(client) {
	client.clockwise(1);
}

function routine_hover(client) {
	client.stop();
}

function handleCommand(req, res, client, command, commandHandler) {
	let body = '';
	req.on('data', chunk => {
	  // No data to process in this case, but this is required for the 'end' event to trigger
	});
  
	commandHandler(client);
  
	req.on('end', () => {
	  console.log(command);
	  fs.writeFile('./data/commands.json', body, err => {
		if (err) {
		  console.error(err);
		  res.statusCode = 500;
		  res.end(`Error: Could not ${command} drone`);
		} else {
		  res.statusCode = 200;
		  res.end(`Drone successfully ${command}`);
		}
	  });
	});
  }



function http_takeoff(req, res, client)
{
	handleCommand(req, res, client, 'takeoff', routine_takeoff);
}

function http_land(req, res, client)
{
	handleCommand(req, res, client, 'land', routine_land);
}

function http_forward(req, res, client)
{
	handleCommand(req, res, client, 'move forward', move_forward);
}

function http_backward(req, res, client)
{
	handleCommand(req, res, client, 'move backward', move_backward);
}

function http_left(req, res, client)
{
	handleCommand(req, res, client, 'move left', move_left);
}

function http_right(req, res, client)
{
	handleCommand(req, res, client, 'move right', move_right);
}

function http_ascend(req, res, client)
{
	handleCommand(req, res, client, 'ascending', move_ascend)
}

function http_descend(req, res, client)
{
	handleCommand(req, res, client, 'descending', move_descend)
}

function http_rotate_left(req, res, client)
{
	handleCommand(req, res, client, 'rotating left', move_rotate_left);
}

function http_rotate_right(req, res, client) 
{
	handleCommand(req, res, client, 'rotating right', move_rotate_right);
}

function http_hover(req, res, client)
{
	handleCommand(req, res, client, 'hovering', routine_hover);
}

/** Function to check for movement post requests and execute
 *  the corresponding movement if request is applicable.
 * 
 * @param {*} req http request body
 * @param {*} res http response body
 * @param {*} client drone client that is being controlled.
 */
function http_movement_API(req, res, client) {
	const actions = {
	  '/api/drone/move/takeoff': http_takeoff,
	  '/api/drone/move/land': http_land,
	  '/api/drone/move/forward': http_forward,
	  '/api/drone/move/backward': http_backward,
	  '/api/drone/move/left': http_left,
	  '/api/drone/move/right': http_right,
	  '/api/drone/move/up': http_ascend,
	  '/api/drone/move/down': http_descend,
	  '/api/drone/move/rotate-left': http_rotate_left,
	  '/api/drone/move/rotate-right': http_rotate_right,
	  '/api/drone/move/hover': http_hover
	};
  
	if (req.method === 'POST' && actions[req.url]) {
	  actions[req.url](req, res, client);
	}
  }

module.exports =
{
	http_takeoff,
	http_land,
	http_hover,
	http_forward,
	http_backward,
	http_left,
	http_right,
	http_ascend,
	http_descend,
	http_rotate_left,
	http_rotate_right,
	http_movement_API
}
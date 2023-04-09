
const http = require('http')
const url = require('url')
const arDone = require('ar-drone')
const cv = require('../opencv');
const fs = require('fs');
const jimp = require('jimp');
const NodeWebcam = require("node-webcam");
const client = arDone.createClient();
const axios = require('axios')
const FormData = require("form-data")
const moment = require("moment");
const Jimp = require('jimp');

client.config('general:navdata_demo', true);
client.config('general:navdata_options', 'navdata_options');
client.config("control:outdoor",false);
client.config("control:altitude_max", 1500);//height in mm 
client.config("control:flight_without_shell",false);
client.config('control:indoor_euler_angle_max', 0.17); //angle in rads 
client.config('control:control_vz_max',200);

//Emergency land on Ctrl + C **************************************************************************
var exiting = false;
process.on('SIGINT', function() {
    if (exiting) {
        process.exit(0);
    } else {
        console.log('Got SIGINT. Landing, press Control-C again to force exit.');
        exiting = true;
        mission.control().disable();
        client.land(function() {
            process.exit(0);
        });
    }
});

const mlreqOptions = {
	hostname: "127.0.0.1",
	port: 1000,
	path: "/get_boxes/",
	method: "GET"
}

const predictOptions = {
	hostname: "127.0.0.1",
	port: 1000,
	path: "/predict_img/",
	method: "GET"
}


let boxes;
let isGettingBoxes = false;
let preBoxedImg;

const USE_DRONE = true;
const pngStream = client.getPngStream();
let lastPng;

let MISSION_START_TIME;


let recentEvent = {
	message:"",
	image: undefined,
	detections: 0,
	timestamp: moment(),
	localtime: moment()
};

//{"message":"Alert-Test", "timestamp":"01:20:10", "localtime":"01:32:23", "thumbnail":""}

pngStream.on('data', buffer => {
	lastPng = buffer;
})
.on('error', err => {
	console.log('png stream error');
	console.log(err);
})

function liftoff() {
	client.takeoff();
	console.log("Takeoff command sent");
}

function Land() {
	client.land();
	console.log("Land command sent");
}

function forwards() {
	client.front(1);
	console.log("Forwards command sent");
}

function backwards() {
	client.back(1);
	console.log("Backwards command sent");
}

function mvLeft() {
	client.left(1);
	console.log("Move left command sent");
}

function mvRight() {
	client.right(1);
	console.log("Move right command sent");
}

function rise() {
	client.up(1);
	console.log("Rise command sent");
}

function sink() {
	client.down(1);
	console.log("Sink command sent");
}

function rotateLeft() {
	client.counterClockwise(1);
	console.log("Rotate left command sent");
}

function rotateRight() {
	client.clockwise(1);
	console.log("Rotate right command sent");
}

function Hover() {
	client.stop();
	console.log("Hover command sent");
}

let model = undefined;

const server = http.createServer((req, res) => {
	if(req.url === "/camera") {
		
		if (!USE_DRONE) webCamCapture();
		if (lastPng) {
			try {
				res.writeHead('200', {'Content-Type': 'image/png'});
				
				if (!USE_DRONE) lastPng = fs.readFileSync('./src/known.jpg');
				detect(lastPng);

				const data = {image: lastPng, boxes: boxes};
				const dataBuffer = Buffer.from(JSON.stringify(data));
				res.end(lastPng);
			} catch (e) {
				console.log(e);
			}
			
		} else {
			res.writeHead(503);
			res.end('No stream data recieved.');
		}
	}

	if (req.url === "/predict_img") {
		lastPng = fs.readFileSync('./src/known.jpg');
		getPreBoxImage(lastPng);
		if (res)
		res.end(preBoxedImg);
	}

	if (req.url === "/get_boxes") {
		if (typeof boxes === undefined || !boxes) {
			res.end("");
			return;
		}
		res.end(JSON.stringify(boxes?.boxes));
	}

	if (req.url === "/event" && req.method === 'GET') {
		if (recentEvent.image === undefined) {
			res.writeHead(500);
			res.end("No events to return");
			return;
		}
		res.writeHead(200);
		res.end(JSON.stringify(recentEvent));
	}

	if (req.url === "/light") {
		client.animateLeds('red', 20, 5);
		res.end("lights on");
	}

	//console.log(req.url);
	//Update missions with new mission set.
	if(req.url === "/post_missions" && req.method === 'POST') 
	{
		let body = '';
		req.on('data', chunk => {
			body += chunk.toString();
		})

		req.on('end', () => {
			fs.writeFile('./data/missions.json', body, err => {

				if(err) 
				{
					console.error(err);
					res.statusCode = 500;
					res.end("Error: Could not save mission data");
				}
				else
				{
					res.statusCode = 200;
					res.end("Mission data saved successfully");
				}
			});
		});
	}

	//Read current missions
	if(req.url === "/get_missions" && req.method === 'GET') {
		fs.readFile('./data/missions.json', (err, data) => {
			if(err) 
			{
				console.error(err);
				res.statusCode = 500;
				res.end("Error: Could not read mission data");
			}
			else
			{
				res.statusCode = 200;
				res.setHeader("Content-Type", "application/json");
				res.end(data);
			}
		});
	}

	if(req.url === "/api/drone/move/takeoff" && req.method === 'POST') 
	{
		let body = '';
		req.on('data', chunk => {
			
		})

		//TODO: takeoff move command here
		liftoff();
		req.on('end', () => {
			console.log("takeoff");
			fs.writeFile('./data/commands.json', body, err => {

				if(err) 
				{
					console.error(err);
					res.statusCode = 500;
					res.end("Error: Could not takeoff");
				}
				else
				{
					res.statusCode = 200;
					res.end("Drone successfully took flight");
				}
			});
		});

	}

	if(req.url === "/api/drone/move/land" && req.method === 'POST') 
	{
		let body = '';
		req.on('data', chunk => {
			
		})

		//TODO: Forward move command here
		Land();
		req.on('end', () => {
			console.log("land");
			fs.writeFile('./data/commands.json', body, err => {

				if(err) 
				{
					console.error(err);
					res.statusCode = 500;
					res.end("Error: Could not land drone");
				}
				else
				{
					res.statusCode = 200;
					res.end("Drone successfully landed");
				}
			});
		});

	}

	if(req.url === "/api/drone/move/forward" && req.method === 'POST') 
	{
		let body = '';
		req.on('data', chunk => {
			
		})

		//TODO: Forward move command here
		forwards()
		req.on('end', () => {
			console.log("forward");
			fs.writeFile('./data/commands.json', body, err => {

				if(err) 
				{
					console.error(err);
					res.statusCode = 500;
					res.end("Error: Could not move drone forward");
				}
				else
				{
					res.statusCode = 200;
					res.end("Drone successfully moved forward");
				}
			});
		});

	}

	if(req.url === "/api/drone/move/backward" && req.method === 'POST') 
	{
		let body = '';
		req.on('data', chunk => {
			
		})

		//TODO: Forward move command here
		backwards();
		req.on('end', () => {
			console.log("backward");
			fs.writeFile('./data/commands.json', body, err => {

				if(err) 
				{
					console.error(err);
					res.statusCode = 500;
					res.end("Error: Could not move drone backward");
				}
				else
				{
					res.statusCode = 200;
					res.end("Drone successfully moved backward");
				}
			});
		});
	}

	if(req.url === "/api/drone/move/left" && req.method === 'POST') 
	{
		let body = '';
		req.on('data', chunk => {
			
		})

		//TODO: Forward move command here
		mvLeft();
		req.on('end', () => {
			console.log("left");
			fs.writeFile('./data/commands.json', body, err => {

				if(err) 
				{
					console.error(err);
					res.statusCode = 500;
					res.end("Error: Could not move drone left");
				}
				else
				{
					res.statusCode = 200;
					res.end("Drone successfully moved left");
				}
			});
		});
	}

	if(req.url === "/api/drone/move/right" && req.method === 'POST') 
	{
		let body = '';
		req.on('data', chunk => {
			
		})

		//TODO: Forward move command here
		mvRight();
		req.on('end', () => {

			console.log("right");
			fs.writeFile('./data/commands.json', body, err => {

				if(err) 
				{
					console.error(err);
					res.statusCode = 500;
					res.end("Error: Could not move drone right");
				}
				else
				{
					res.statusCode = 200;
					res.end("Drone successfully moved right");
				}
			});
		});
	}

	if(req.url === "/api/drone/move/up" && req.method === 'POST') 
	{
		let body = '';
		req.on('data', chunk => {
			
		})

		//TODO: Forward move command here
		rise();
		req.on('end', () => {
			console.log("up");
			fs.writeFile('./data/commands.json', body, err => {

				if(err) 
				{
					console.error(err);
					res.statusCode = 500;
					res.end("Error: Could not move drone up");
				}
				else
				{
					res.statusCode = 200;
					res.end("Drone successfully moved up");
				}
			});
		});
	}

	if(req.url === "/api/drone/move/down" && req.method === 'POST') 
	{
		let body = '';
		req.on('data', chunk => {
			
		})

		//TODO: Forward move command here
		sink()
		req.on('end', () => {
			console.log("down");
			fs.writeFile('./data/commands.json', body, err => {

				if(err) 
				{
					console.error(err);
					res.statusCode = 500;
					res.end("Error: Could not move drone down");
				}
				else
				{
					res.statusCode = 200;
					res.end("Drone successfully moved down");
				}
			});
		});
	}

	if(req.url === "/api/drone/move/rotate-left" && req.method === 'POST') 
	{
		let body = '';
		req.on('data', chunk => {
			
		})

		//TODO: Forward move command here
		rotateLeft();
		req.on('end', () => {
			console.log("rotate-left");
			fs.writeFile('./data/commands.json', body, err => {

				if(err) 
				{
					console.error(err);
					res.statusCode = 500;
					res.end("Error: Could not rotate drone left");
				}
				else
				{
					res.statusCode = 200;
					res.end("Drone successfully rotated left");
				}
			});
		});
	}

	if(req.url === "/api/drone/move/rotate-right" && req.method === 'POST') 
	{
		let body = '';
		req.on('data', chunk => {
			
		})

		//TODO: Forward move command here
		rotateRight();
		req.on('end', () => {
			console.log("rotate-right");
			fs.writeFile('./data/commands.json', body, err => {

				if(err) 
				{
					console.error(err);
					res.statusCode = 500;
					res.end("Error: Could not rotate drone right");
				}
				else
				{
					res.statusCode = 200;
					res.end("Drone successfully rotated right");
				}
			});
		});
	}

	if(req.url === "/api/drone/move/hover" && req.method === 'POST') 
	{
		let body = '';
		req.on('data', chunk => {
			
		})

		//TODO: Forward move command here
		Hover()
		req.on('end', () => {
			console.log("hover");
			fs.writeFile('./data/commands.json', body, err => {

				if(err) 
				{
					console.error(err);
					res.statusCode = 500;
					res.end("Error: Could not make drone hover");
				}
				else
				{
					res.statusCode = 200;
					res.end("Drone successfully stopped moving");
				}
			});
		});

	}

	if (req.url.startsWith('/api/drone/start/') && req.method === 'POST') {

		const missionId = parseInt(req.url.slice('/api/drone/start/'.length));
		// TODO: Implement logic for starting drone mission with the provided mission ID
		// Example:
		//stopCurrentMission()
		let status; // = startDroneMission(missionId);
		console.log("Starting mission with ID:", missionId);

		let body = '';
		req.on('data', chunk => {
			
		})

		req.on('end', () => {

		  if(status == 200)
		  {
			MISSION_START_TIME = moment();
			res.statusCode = 200;
			res.end('Drone mission started');
			console.log("Drone mission with ID:"+missionID+" started");
		  }
		  else
		  {
			res.statusCode = 500;
			res.end('Drone mission failed to start');
			console.error("Drone mission failed to start");
		  }

		});
	}

	if (req.url === '/api/drone/stop' && req.method === 'POST') {
		// TODO: Implement logic for stopping drone mission
		// Example: stopDroneMission();
		let status; //=stopDroneMission(); ///pass by reference a status if possible

		let body = '';
		req.on('data', chunk => {
			
		})
		
		console.log("Stopping mission");

		if(status == 200)
		{
		  res.statusCode = 200;
		  res.end('Drone mission stopped');
		  console.log("Drone mission was stopped");
		}
		else
		{
		  res.statusCode = 500;
		  res.end('Drone mission could not be stopped');
		}
	}
});

server.listen(6969, () => {
	console.log("server running on port 6969");
});

async function detect(image) {
	let buf = image;
	if (!USE_DRONE) buf = fs.readFileSync('./src/known.jpg')

	if(buf === undefined || isGettingBoxes) return;
	try {
		isGettingBoxes = true;
		const formData = new FormData();
		const headers = {
			...formData.getHeaders()
		}
		const buf64 = Buffer.from(buf).toString("base64")

		if (!USE_DRONE) formData.append('image', fs.createReadStream('./src/known.jpg'));

		fs.writeFileSync("./dronecap.png", buf);
		
		
		formData.append('image', fs.createReadStream('./dronecap.png'));
		const response = await axios.post("http://127.0.0.1:1000/get_boxes/", formData, headers );
		boxes = response.data;
		if (boxes?.boxes) {
			const currentTime = moment();
			const difference = moment.duration(currentTime.diff(recentEvent.localtime)).asSeconds();
			
			if (difference > 20) {
				recentEvent = {
					image: preBoxedImg,
					detections: boxes?.boxes,
					localtime: currentTime,
					timestamp: currentTime.diff(MISSION_START_TIME)
				}
				
				recentEvent.localtime = currentTime;
			}
		}
	} catch (e) {
		console.log(e)
	} finally {
		isGettingBoxes = false;
	}
	
}

const getPreBoxImage = async (image) => {
	const buf = fs.readFileSync('./src/known.jpg')
	const req = http.request(predictOptions, res => {
		res.on('data', data => {
			preBoxedImg = data;
		})
	});
	const data = {image: buf};
	const dataBuffer = Buffer.from(JSON.stringify(data))
	req.write(dataBuffer);
	req.end();
}

//export default drone;
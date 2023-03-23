
const http = require('http')
const url = require('url')
var autonomy = require('ardrone-autonomy');
var mission = autonomy.createMission();
const arDone = require('ar-drone')
const cv = require('../opencv');
const fs = require('fs');
const jimp = require('jimp');
const NodeWebcam = require("node-webcam");
const client = arDone.createClient();
const axios = require('axios')
const FormData = require("form-data")
const moment = require("moment");


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
let preBoxedImg;

// const pngStream = client.getPngStream();
let lastPng;

let MISSION_START_TIME;


let recentEvent = {
	message: "",
	image: undefined,
	detections: 0,
	timestamp: moment(),
	localtime: moment()
};

//{"message":"Alert-Test", "timestamp":"01:20:10", "localtime":"01:32:23", "thumbnail":""}
// pngStream.on('data', buffer => {
// 	lastPng = buffer;
// })
// .on('error', err => {
// 	console.log('png stream error');
// 	console.log(err);
// })


let model = undefined;
//initializeTf();

const server = http.createServer((req, res) => {
	if (req.url === "/camera") {

		webCamCapture();
		if (lastPng) {
			try {
				//res.writeHead('200', {'Content-Type': 'image/png'});


				detect(lastPng);
				lastPng = fs.readFileSync('./src/known.jpg');
				const data = { image: lastPng, boxes: boxes };
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
	if (req.url === "/post_missions" && req.method === 'POST') {
		let body = '';
		req.on('data', chunk => {
			body += chunk.toString();
		})

		req.on('end', () => {
			fs.writeFile('./data/missions.json', body, err => {

				if (err) {
					console.error(err);
					res.statusCode = 500;
					res.end("Error: Could not save mission data");
				}
				else {
					res.statusCode = 200;
					res.end("Mission data saved successfully");
				}
			});
		});
	}

	//Read current missions
	if (req.url === "/get_missions" && req.method === 'GET') {
		fs.readFile('./data/missions.json', (err, data) => {
			if (err) {
				console.error(err);
				res.statusCode = 500;
				res.end("Error: Could not read mission data");
			}
			else {
				res.statusCode = 200;
				res.setHeader("Content-Type", "application/json");
				res.end(data);
			}
		});
	}

	if (req.url === "/api/drone/move/forward" && req.method === 'POST') {
		let body = '';
		req.on('data', chunk => {

		})

		//TODO: Forward move command here
		req.on('end', () => {
			console.log("forward");
			fs.writeFile('./data/commands.json', body, err => {

				if (err) {
					console.error(err);
					res.statusCode = 500;
					res.end("Error: Could not move drone forward");
				}
				else {
					res.statusCode = 200;
					res.end("Drone successfully moved forward");
				}
			});
		});

	}

	if (req.url === "/api/drone/move/backward" && req.method === 'POST') {
		let body = '';
		req.on('data', chunk => {

		})

		//TODO: Forward move command here
		req.on('end', () => {
			console.log("backward");
			fs.writeFile('./data/commands.json', body, err => {

				if (err) {
					console.error(err);
					res.statusCode = 500;
					res.end("Error: Could not move drone backward");
				}
				else {
					res.statusCode = 200;
					res.end("Drone successfully moved backward");
				}
			});
		});
	}

	if (req.url === "/api/drone/move/left" && req.method === 'POST') {
		let body = '';
		req.on('data', chunk => {

		})

		//TODO: Forward move command here
		req.on('end', () => {
			console.log("left");
			fs.writeFile('./data/commands.json', body, err => {

				if (err) {
					console.error(err);
					res.statusCode = 500;
					res.end("Error: Could not move drone left");
				}
				else {
					res.statusCode = 200;
					res.end("Drone successfully moved left");
				}
			});
		});
	}

	if (req.url === "/api/drone/move/right" && req.method === 'POST') {
		let body = '';
		req.on('data', chunk => {

		})

		//TODO: Forward move command here
		req.on('end', () => {

			console.log("right");
			fs.writeFile('./data/commands.json', body, err => {

				if (err) {
					console.error(err);
					res.statusCode = 500;
					res.end("Error: Could not move drone right");
				}
				else {
					res.statusCode = 200;
					res.end("Drone successfully moved right");
				}
			});
		});
	}

	if (req.url === "/api/drone/move/up" && req.method === 'POST') {
		let body = '';
		req.on('data', chunk => {

		})

		//TODO: Forward move command here
		req.on('end', () => {
			console.log("up");
			fs.writeFile('./data/commands.json', body, err => {

				if (err) {
					console.error(err);
					res.statusCode = 500;
					res.end("Error: Could not move drone up");
				}
				else {
					res.statusCode = 200;
					res.end("Drone successfully moved up");
				}
			});
		});
	}

	if (req.url === "/api/drone/move/down" && req.method === 'POST') {
		let body = '';
		req.on('data', chunk => {

		})

		//TODO: Forward move command here
		req.on('end', () => {
			console.log("down");
			fs.writeFile('./data/commands.json', body, err => {

				if (err) {
					console.error(err);
					res.statusCode = 500;
					res.end("Error: Could not move drone down");
				}
				else {
					res.statusCode = 200;
					res.end("Drone successfully moved down");
				}
			});
		});
	}

	if (req.url === "/api/drone/move/rotate-left" && req.method === 'POST') {
		let body = '';
		req.on('data', chunk => {

		})

		//TODO: Forward move command here
		req.on('end', () => {
			console.log("rotate-left");
			fs.writeFile('./data/commands.json', body, err => {

				if (err) {
					console.error(err);
					res.statusCode = 500;
					res.end("Error: Could not rotate drone left");
				}
				else {
					res.statusCode = 200;
					res.end("Drone successfully rotated left");
				}
			});
		});
	}

	if (req.url === "/api/drone/move/rotate-right" && req.method === 'POST') {
		let body = '';
		req.on('data', chunk => {

		})

		//TODO: Forward move command here
		req.on('end', () => {
			console.log("rotate-right");
			fs.writeFile('./data/commands.json', body, err => {

				if (err) {
					console.error(err);
					res.statusCode = 500;
					res.end("Error: Could not rotate drone right");
				}
				else {
					res.statusCode = 200;
					res.end("Drone successfully rotated right");
				}
			});
		});
	}

	if (req.url.startsWith('/api/drone/start/') && req.method === 'POST') {

		const missionId = parseInt(req.url.slice('/api/drone/start/'.length));
		var mission = autonomy.createMission(client);
		switch (missionId) {
			case 1:
				sweep_mission(mission);
				break;
			case 2:
				squareSpiral(mission);
				break;
			case 3:
				square_path(mission);
				break;

			default:
				break;
		};
		 mission.run(function (err, result) {
			if (err) {
				console.trace("Oops, something bad happened: %s", err.message);
				mission.client().stop();
				mission.client().land();
			} else {
				console.log("Mission success!");
				process.exit(0);
			}});

		

		// TODO: Implement logic for starting drone mission with the provided mission ID
		// Example:
		//stopCurrentMission()
		let status; // = startDroneMission(missionId);
		console.log("Starting mission with ID:", missionId);

		let body = '';
		req.on('data', chunk => {

		})

		req.on('end', () => {

			if (status == 200) {
				MISSION_START_TIME = moment();
				res.statusCode = 200;
				res.end('Drone mission started');
				console.log("Drone mission with ID:" + missionID + " started");
			}
			else {
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
		mission.control().disable();
        mission.client().land(function() {
            process.exit(0)});

		let body = '';
		req.on('data', chunk => {

		})

		console.log("Stopping mission");

		if (status == 200) {
			res.statusCode = 200;
			res.end('Drone mission stopped');
			console.log("Drone mission was stopped");
		}
		else {
			res.statusCode = 500;
			res.end('Drone mission could not be stopped');
		}
	}
});

server.listen(6969, () => {
	console.log("server running on port 6969");
});

async function detect(image) {
	const buf = fs.readFileSync('./src/known.jpg')
	//fs.writeFileSync('./ml-server/photoDir/photo.jpg', buf)
	if (image === undefined) return;
	try {

		const formData = new FormData();
		const headers = {
			...formData.getHeaders()
		}
		formData.append('image', fs.createReadStream('./src/known.jpg'));
		const response = await axios.post("http://127.0.0.1:1000/get_boxes/", formData, { headers });
		boxes = response.data;
		if (boxes?.boxes) {
			const currentTime = moment();
			const difference = currentTime.diff(recentEvent.localtime);

			if (Number(difference.seconds()) > 20) {
				recentEvent = {
					image: preBoxedImg,
					detections: boxes?.boxes,
					localtime: currentTime,
					timestamp: currentTime.diff(MISSION_START_TIME)
				}
			}
			recentEvent.localtime = currentTime;
		}
		// const req = http.request(mlreqOptions, res => {
		// 	res.on('data', data => {
		// 		boxes = data;

		// 		console.log("data get");
		// 	})
		// 	res.on('error', err => {
		// 		console.log("Error in req to python/ML")
		// 	})
		// });



		// let tfimg = tf.node.decodeJpeg(buf);
		// tfimg = tfimg.reshape([1,640,360,3]);
		// console.log(tfimg.shape)

		// const predictions = await model.predict(tfimg);
		// console.log(`predictions length = ${predictions.length}`);
		// console.log(predictions);
		// for(let i =0; i < predictions.length; i++)
		// {
		// 	console.log(predictions[i].dataSync());
		// }
	} catch (e) {
		console.log(e)
	}

}

const getPreBoxImage = async (image) => {
	const buf = fs.readFileSync('./src/known.jpg')
	const req = http.request(predictOptions, res => {
		res.on('data', data => {
			preBoxedImg = data;
		})
	});
	const data = { image: buf };
	const dataBuffer = Buffer.from(JSON.stringify(data))
	req.write(dataBuffer);
	req.end();
}

const opts = {
	width: 1280,
	height: 720,
	quality: 100,
	output: "png",
	//callbackReturn: "buffer"
}
const webcam = NodeWebcam.create(opts);

async function webCamCapture() {
	webcam.clear();
	await webcam.capture("test", (err, data) => {
		if (err) console.log(err);
		lastPng = data;
	});
}

//export default drone;

function squareSpiral(mission){
    mission.takeoff()
    .zero()
    .altitude(1)
    .hover(1000)
    .forward(1)
    .cw(90)
    .forward(1)
    .cw(90)
    .forward(2)
    .cw(90)
    .forward(2)
    .cw(90)
    .forward(3)
    .cw(90)
    .forward(3)
    .cw(90)
    .forward(4)
    .cw(90)
    .forward(4)
    .cw(90)
    .forward(4)
    .cw(90)
    .forward(4)
    .go({x:0, y:0})
    .hover(1000)
    .land();
}

function sweep_mission(mission) {
	mission.takeoff()
		.zero()
		.altitude(1)
		.hover(500)
		.forward(1)
		.hover(500)
		.cw(180)
		.hover(500)
		.forward(0.5)
		.hover(500)
		.cw(90)
		.hover(500)
		.forward(1)
		.hover(500)
		.ccw(90)
		.hover(500)
		.forward(0.5)
		.hover(500)
		.ccw(90)
		.hover(500)
		.forward(1)
		.hover(500)
		.cw(90)
		.hover(500)
		.forward(0.5)
		.hover(500)
		.cw(90)
		.hover(500)
		.forward(1)
		.hover(500)
		.go({ x: 0, y: 0 })
		.hover(1000)
		.land();
}

function square_path(mission){
	mission.takeoff()
       .zero()
       .hover(500)
       .altitude(2)
       .forward(2)
       .cw(90)
       .forward(2)
       .cw(90)
       .forward(2)
       .cw(90)
       .forward(2)
       .go({x:0, y:0})
       .hover(500)
       .land();
}
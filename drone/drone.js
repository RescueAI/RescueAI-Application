
const http = require('http')
const url = require('url')
const arDone = require('ar-drone')
const cv = require('../opencv');
const fs = require('fs');
const jimp = require('jimp');
const NodeWebcam = require("node-webcam");
const client = arDone.createClient();
const videoStream = client.getVideoStream();

const axios = require('axios')
const FormData = require("form-data")
const moment = require("moment");
const Jimp = require('jimp');

const { http_movement_API } = require('./controls');

client.config('general:navdata_demo', true);
client.config('general:navdata_options', 'navdata_options');
client.config("control:outdoor",false);
client.config("control:altitude_max", 1500);//height in mm 
client.config("control:flight_without_shell",false);
client.config('control:indoor_euler_angle_max', 0.17); //angle in rads 
client.config('control:control_vz_max',200);

const DRONE_ADDRESS = '192.168.2.1'

/*const Stream = require('node-rtsp-stream');
const stream = new Stream(
	{
		name: 'DroneStream',
		streamUrl: `rtsp://${DRONE_ADDRESS}/live.sdp`,
		wsPort: 9999,
		ffmpegOptions: {
			'-stat':'',
			'-r': 30, //Set the frame rate
		},
	});

*/








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

let model = undefined;

const server = http.createServer((req, res) => {

	//Read
	//fs.createReadStream(__dirname + "/index.html").pipe(res);

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

	if (req.url.startsWith('/api/drone/move/') && req.method === 'POST') {
		http_movement_API(req, res, client);
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
	//fs.writeFileSync('./ml-server/photoDir/photo.jpg', buf)

	if(buf === undefined || isGettingBoxes) return;
	try {
		isGettingBoxes = true;
		const formData = new FormData();
		const headers = {
			...formData.getHeaders()
		}

		if (!USE_DRONE) formData.append('image', fs.createReadStream('./src/known.jpg'));
		else {
			console.log(buf);
			const img = await Jimp.read(buf);
			buf = img.bitmap;
			
			//formData.append('image', img.bitmap);
		}

		const response = await axios.post("http://127.0.0.1:1000/get_boxes/", );
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
		if(err) console.log(err);
		lastPng = data;
	});
}

//export default drone;
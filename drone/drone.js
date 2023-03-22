
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
let preBoxedImg;

// const pngStream = client.getPngStream();
let lastPng;


let recentEvent = {
	image: undefined,
	numberOfDetections: 0,
	timeStamp: moment()
};
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
	if(req.url === "/camera") {
		
		webCamCapture();
		if (lastPng) {
			try {
				//res.writeHead('200', {'Content-Type': 'image/png'});
				
				
				detect(lastPng);
				lastPng = fs.readFileSync('./src/known.jpg');
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

	if (req.url === "/event") {
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

	if(req.url === "/api/drone/move/hover" && req.method === 'POST') 
	{
		let body = '';
		req.on('data', chunk => {
			
		})

		req.on('end', () => {
			client.stop();
		});
	}

	if(req.url === "/api/drone/move/land" && req.method === 'POST') 
	{
		let body = '';
		req.on('data', chunk => {
			
		})

		req.on('end', () => {
			client.land();
		});
	}

	if(req.url === "/api/drone/move/takeoff" && req.method === 'POST') 
	{
		let body = '';
		req.on('data', chunk => {
			
		})

		req.on('end', () => {
			client.takeoff();
		});
	}

	if(req.url === "/api/drone/move/forward" && req.method === 'POST') 
	{
		let body = '';
		req.on('data', chunk => {
			
		})

		req.on('end', () => {
			client.front(1);
			console.log("Moving Forwards")
		});
	}

	if(req.url === "/api/drone/move/backward" && req.method === 'POST') 
	{
		let body = '';
		req.on('data', chunk => {
			
		})

		//TODO: Forward move command here
		req.on('end', () => {
			client.back(1);
			console.log("Moving Backwards")
		});
	}

	if(req.url === "/api/drone/move/left" && req.method === 'POST') 
	{
		let body = '';
		req.on('data', chunk => {
			
		})

		//TODO: Forward move command here
		req.on('end', () => {
			client.left(1);
			console.log("Moving Left")
		});
	}

	if(req.url === "/api/drone/move/right" && req.method === 'POST') 
	{
		let body = '';
		req.on('data', chunk => {
			
		})

		//TODO: Forward move command here
		req.on('end', () => {
			client.right(1);
			console.log("Moving Right")
		});
	}

	if(req.url === "/api/drone/move/up" && req.method === 'POST') 
	{
		let body = '';
		req.on('data', chunk => {
			
		})

		//TODO: Forward move command here
		req.on('end', () => {
			client.up(1);
			console.log("Moving Up")
		});
	}

	if(req.url === "/api/drone/move/down" && req.method === 'POST') 
	{
		let body = '';
		req.on('data', chunk => {
			
		})

		//TODO: Forward move command here
		req.on('end', () => {
			client.down(1);
			console.log("Moving Down")
		});
	}

	if(req.url === "/api/drone/move/rotate-left" && req.method === 'POST') 
	{
		let body = '';
		req.on('data', chunk => {
			
		})

		//TODO: Forward move command here
		req.on('end', () => {
			client.counterClockwise(1);
			console.log("Turning Left")
		});
	}

	if(req.url === "/api/drone/move/rotate-right" && req.method === 'POST') 
	{
		let body = '';
		req.on('data', chunk => {
			
		})

		//TODO: Forward move command here
		req.on('end', () => {
			client.clockwise(1);
			console.log("Turning Right")
		});
	}

});

server.listen(6969, () => {
	console.log("server running on port 6969");
});

async function detect(image) {
	const buf = fs.readFileSync('./src/known.jpg')
	//fs.writeFileSync('./ml-server/photoDir/photo.jpg', buf)
	if(image === undefined) return;
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
			const difference = currentTime.diff(recentEvent.timeStamp);
			
			if (Number(difference.seconds()) > 20) {
				recentEvent = {
					image: preBoxedImg,
					numberOfDetections: boxes?.boxes,
					timeStamp: currentTime
				}
			}
			recentEvent.timeStamp = currentTime;
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

const http = require('http')
const url = require('url')
const arDone = require('ar-drone')
const tf = require('@tensorflow/tfjs-node')
const tfConverter = require("@tensorflow/tfjs-converter")
const cv = require('../opencv');
const fs = require('fs');
const jimp = require('jimp');
const NodeWebcam = require("node-webcam");
const client = arDone.createClient();
const axios = require('axios')
const FormData = require("form-data")

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
				console.log("PNG written");
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
		res.end(preBoxedImg);
	}

	if (req.url === "/get_boxes") {
		console.log(typeof boxes)
		console.log(boxes?.boxes);
		console.log(`boxes in get_boxes ${boxes}`)
		if (typeof boxes === undefined || !boxes) {
			console.log("end empty string")
			res.end("");
			return;
		}
		console.log("return boxes")
		console.log(boxes?.boxes)
		res.end(JSON.stringify(boxes?.boxes));
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

	if(req.url === "/api/drone/move/forward" && req.method === 'POST') 
	{
		let body = '';
		req.on('data', chunk => {
			body += chunk.toString();
		})

		//TODO: Forward move command here
		req.on('end', () => {
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
			body += chunk.toString();
		})

		//TODO: Forward move command here
		req.on('end', () => {
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
			body += chunk.toString();
		})

		//TODO: Forward move command here
		req.on('end', () => {
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
			body += chunk.toString();
		})

		//TODO: Forward move command here
		req.on('end', () => {
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
			body += chunk.toString();
		})

		//TODO: Forward move command here
		req.on('end', () => {
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
			body += chunk.toString();
		})

		//TODO: Forward move command here
		req.on('end', () => {
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
			body += chunk.toString();
		})

		//TODO: Forward move command here
		req.on('end', () => {
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
			body += chunk.toString();
		})

		//TODO: Forward move command here
		req.on('end', () => {
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

});

server.listen(6969, () => {
	console.log("server running on port 6969");
});

async function initializeTf() {
	model = await tf.node.loadSavedModel("./models/saved_modelsingle/")
}

async function detect(image) {
	const buf = fs.readFileSync('./src/known.jpg')
	//fs.writeFileSync('./ml-server/photoDir/photo.jpg', buf)
	console.log(`image undefined = ${image === undefined}`)
	if(image === undefined) return;
	try {
		
		const formData = new FormData();
		const headers = {
			...formData.getHeaders()
		}
		formData.append('image', fs.createReadStream('./src/known.jpg'));
		const response = await axios.post("http://127.0.0.1:1000/get_boxes/", formData, { headers });
		boxes = response.data;
		console.log(`boxes in ml req ${boxes}`);

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
	
	console.log("func end")
}

const getPreBoxImage = async (image) => {
	const buf = fs.readFileSync('./src/known.jpg')
	const req = http.request(predictOptions, res => {
		res.on('data', data => {
			console.log(data);
			preBoxedImg = data;
		})
	});
	console.log("writing buffer and ending")
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
		console.log(data)
		lastPng = data;
		console.log("written");
	});
}




//export default drone;
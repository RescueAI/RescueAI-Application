
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
initializeTf();

const server = http.createServer((req, res) => {
	if(req.url === "/camera") {
		
		webCamCapture();
		if (lastPng) {
			try {
				console.log("PNG written");
				res.writeHead('200', {'Content-Type': 'image/png'});
				res.end(lastPng);
				
				detect(lastPng);
			} catch (e) {
				console.log(e);
			}
			
		} else {
			res.writeHead(503);
			res.end('No stream data recieved.');
		}
	}

	if (req.url === "/light") {
		client.animateLeds('red', 20, 5);
		res.end("lights on");
	}

	console.log(req.url);

});

server.listen(6969, () => {
	console.log("server running on port 6969");
});

async function initializeTf() {
	model = await tf.node.loadSavedModel("./models/saved_model/")
}

async function detect(image) {
	const buf = fs.readFileSync('./test.png')
	console.log(`image undefined = ${image === undefined}`)
	if(image === undefined) return;
	try {
		
		let tfimg = tf.node.decodePng(buf);
		tfimg = tfimg.reshape([1280,720,3]);
		console.log(tfimg.shape)
		
		const predictions = await model.predict(tfimg);
		console.log(`predictions length = ${predictions.length}`);
		for(let i =0; i < predictions.length; i++)
		{
			console.log(predictions[i].class);
		}
	} catch (e) {
		console.log(e)
	}
	
	console.log("func end")
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
		console.log(data)
		lastPng = data;
		console.log("written");
	});
}

//export default drone;
const http = require('http')
const url = require('url')
const arDone = require('ar-drone')

const client = arDone.createClient();
const pngStream = client.getPngStream();
let lastPng;
pngStream.on('data', buffer => {
	lastPng = buffer;
})
.on('error', err => {
	console.log('png stream error');
	console.log(err);
})

const server = http.createServer((req, res) => {
	
	if(req.url === "/camera") {
		if (lastPng) {
			console.log("PNG written");
			res.writeHead('200', {'Content-Type': 'image/png'});
			res.end(lastPng);
		} else {
			res.writeHead(503);
			res.end('No stream data recieved.');
		}
	}

	if (req.url === "/light") {
		client.animateLeds('red', 20, 5);
		res.end("lights on");
	}

	//console.log(req.url);

});

server.listen(6969, () => {
	console.log("server running on port 6969");
});


//export default drone;
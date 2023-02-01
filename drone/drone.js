const http = require('http')
const url = require('url')
const arDone = require('ar-drone')

const client = arDone.createClient();
console.log(client);
const drone = {
  client,
  server: () => {
    require('ar-drone-png-stream')(client, {port: 5000});
    return new Promise(res => {
			res(true);
		});
	},
	onNavData: cb => {
		client.on('navdata', cb);
	},
	takeoff: () => {
		console.log('take off');
		client.takeoff();
	},
	land: () => {
		console.log('land');
		client.land();
	},
	up: speed => {
		console.log('Up at', speed);
		client.up(speed);
	},
	down: speed => {
		console.log('Down at', speed);
		client.down(speed);
	},
	left: speed => {
		console.log('Left at', speed);
		client.left(speed);
	},
	right: speed => {
		console.log('Right at', speed);
		client.right(speed);
	},
	forward: speed => {
		console.log('Forward at', speed);
		client.front(speed);
	},
	backward: speed => {
		console.log('Backward at', speed);
		client.back(speed);
	},
	counterClockwise: speed => {
		console.log('Counter clockwise at', speed);
		client.counterClockwise(speed);
	},
	clockwise: speed => {
		console.log('Clockwise at', speed);
		client.clockwise(speed);
	},
	stop: () => {
		console.log('Stop');
		client.stop();
	}
};

const server = http.createServer((req, res) => {
	
	const query = url.parse(req.url).query;

	console.log(req.url);

});

server.listen(6969, () => {
	console.log("server running on port 6969");
});


//export default drone;
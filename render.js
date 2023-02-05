import {remote} from 'electron'
const arDrone = remote.require('ar-drone');


const client = arDrone.createClient();

console.log(client);
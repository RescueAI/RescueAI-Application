
import {Hls} from "../node_modules/hls.js/dist/hls.min.js"

const video = document.getElementById('drone-base-video');
const hls = new Hls();

hls.loadSource('http://localhost:9999');
hls.attachMedia(video);
hls.on(Hls.Events.MANIFEST_PARSED, function () {
  video.play();
});
//import * as tf from "@tensorflow/tfjs";
// const cocoSsd = window['coco-ssd'];
// console.log(cocoSsd);
let cvReady = window.cvReady;
const canvas = document.getElementById("image-output");
let camera;
const tf = window.tfjs;
const FPS = 30;
const height = 320;
const width = 480;
let img = undefined;
let lastImg;
let boxes;


setInterval(() => {
  processVideo();
}, 50)
setInterval(()=> {
  updateBoxes();
}, 100);

async function processVideo() {

  fetch("http://localhost:6969/camera")
  .then((data) => {
    return data.blob();
  })
  .then((blob) => {
    img = URL.createObjectURL(blob);
    lastImg = img;
  })
  .catch((err) => {
    console.log(err);
  });
  

    if (img !== undefined)
    {
      document.getElementById("source-image").setAttribute("src", img);
      setTimeout(() => {updateStream();}, 10)
    }
}

const updateBoxes = async () => {
  fetch("http://localhost:6969/get_boxes")
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    boxes = data;
  })
  if (boxes) {}
}

const updateStream = () => {
  try {
    const sourceImage = document.getElementById("source-image");
    const outputCanvas = document.getElementById("image-output");
    const src = cv.imread(sourceImage, cv.IMREAD_COLOR);
    const dst = src.clone();
    if (boxes) {
      console.log(boxes)
      const color = new cv.Scalar(255, 0, 0, 255);
      const thickness = 2;
      for (const box of boxes) {
        const p1 = new cv.Point(box[0], box[1]);
        const p2 = new cv.Point(box[2], box[3]);
        cv.rectangle(dst, p1, p2, color, thickness, cv.LINE_8, 0);
      }
    }
    cv.imshow(outputCanvas, dst);
    src.delete();
    dst.delete();
  } catch (e) {
    console.log(e)
  }
  
}
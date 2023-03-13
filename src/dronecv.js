
// const cocoSsd = window['coco-ssd'];
// console.log(cocoSsd);
let cvReady = window.cvReady;
const canvas = document.getElementById("image-output");

const FPS = 30;
const height = 320;
const width = 480;
let img;
let lastImg;

document.getElementById("button").onclick = () => {
  fetch("http://localhost:6969/light");
};

document.getElementById("camera").onclick = () => {
  processVideo();
};

function processVideo() {
  console.log("processing video");
  lastImg = undefined;
  fetch("http://localhost:6969/camera")
    .then((data) => {
      console.log(data)
      return data.blob();
    })
    .then((blob) => {
      console.log(blob);
      img = URL.createObjectURL(blob);
      console.log(img)
      lastImg = img;
    })
    .catch((err) => {
      console.log(err);
    });
  document.getElementById("image-output").setAttribute("src", img);;
  // const context = canvas.getContext("2d");
  // let outImg = new Image();
  // outImg.src = img;
  // outImg.onload = () => {
  //   context.drawImage(outImg, 0, 0);
  //   console.log("img drawn");
  // };

  if (!cvReady) return;
  console.log("CV stuff happening");
  if (img) {
    let mat = cv.matFromImageData(img);
    cv.imwrite("image-output", mat);
    mat.delete();
  }

  if (!lastImg) return;
  let mat = cv.matFromImageData(lastImg);

  model().detect(mat).then(predictions => {
      console.log(predictions);
    })

  mat.delete();
}

//setInterval(processVideo, 50);

//openCvReady();
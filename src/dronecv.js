let cvReady = false;
const canvas = document.getElementById("image-output");

const FPS = 30;
const height = 320;
const width = 480;
let img;
let lastImg;

const model = cocoSsd;

document.getElementById("button").onclick = () => {
  fetch("http://localhost:6969/light");
};

document.getElementById("camera").onclick = () => {
  processVideo();
};

function processVideo() {
  console.log("processing video");
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
  document.getElementById("img").setAttribute("src", img);
  const context = canvas.getContext("2d");
  outImg = new Image();
  outImg.src = img;
  outImg.onload = () => {
    context.drawImage(outImg, 0, 0);
    console.log("img drawn");
  };

  if (!cvReady) return;
  console.log("CV stuff happening");
  if (img) {
    let mat = cv.matFromImageData(img);
    cv.imwrite("image-output", mat);
  }

  if (!lastImg) return;
  let mat = cv.matFromImageData(lastImg);
  /*model.load().then((mdl) => {
    mdl.detect(mat).then(predictions => {
      //do stuff
    })*/
}

setInterval(processVideo, 20);

function openCvReady() {
  cv["onRuntimeInitialized"] = () => {
    //TODO: Put cv stuff here
    cvReady = true;
    /* if (img) {
      let mat = cv.imread(img);
      cv.imwrite('image-output', mat);
    }

    if(!lastImg) return;
    let mat = cv.imread(lastimg);
    model.load().then((mdl) => {
    mdl.detect(mat).then(predictions => {
      //do stuff
    })
})
*/
  };
}

openCvReady();
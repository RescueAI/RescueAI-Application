const cv = require('./opencv');

const text = document.getElementById("cv")

if (cv !== undefined) text.innerHTML = "CV loaded";
else text.innerHTML = "cv not found";
# RescueAI Application

The following application allows you to use a Parrot AR 2.0 

For ECE 8410:
The contents of the project that are important for computer vision include:
- The ml-server folder
- backend/backend-server.js
- src/dronecv.js

This project uses opencv.js and a YOLOv8 model

To run the program currently:

- Open two terminals and navigate to the rescueai-application folder in both folders
- run "npm install" to ensure dependencies are installed
- run "python ./ml-server/ml-server.py" in one terminal
- run "npm start" in the other
- ensure that you are either connected to a Parrot AR 2.0 drone, or have changed the USE_DRONE variable in backend/backend-server.js
- if you are running the application without a drone, you will need an image saved in src/known.jpg that you want to use
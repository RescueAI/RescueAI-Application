const { app, BrowserWindow } = require('electron');
const path = require('path');

//Dev tool to allow live reloading of application on file changes.
const electron = require('electron');
require('electron-reload')(__dirname);

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
    },

    minWidth: 800,
    minHeight: 600
  });

  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();
});


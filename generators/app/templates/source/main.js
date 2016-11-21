
'use strict';

var url = require('url');
var path = require('path');
var electron = require('electron');
var mainWindow = null;

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
function createWindow () {
    // Create the browser window.
    (mainWindow = new electron.BrowserWindow({
        width: 800,
        height: 600
    }))
    // and load the index.html of the app.
    .loadURL( url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
    // reload window
    // mainWindow.webContents.reloadIgnoringCache();

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
};

electron.app.on('ready', createWindow);

electron.app.on('activate', function () {
    mainWindow === null && createWindow();
});

electron.app.on('window-all-closed', function () {
    process.platform !== 'darwin' && electron.app.quit();
});

// from electron.ipcRenderer.send('async'
electron.ipcMain.on('async', function () {
    console.log(arguments);
})
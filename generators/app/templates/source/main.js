
'use strict';

var url = require('url');
var path = require('path');
var electron = require('electron');
var win = null;

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
function createWindow () {
    // Create the browser window.
    (win = new electron.BrowserWindow({
        width: 1000,
        height: 800,
        minWidth: 600,
        minHeight: 400,
        title: '<%=title%>',
        autoHideMenuBar: true,
        x: 100,
        y: 20,
        backgroundColor: '#2e2c29',
    }))
    // and load the index.html of the app.
    .loadURL( url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));
    // Open the DevTools.
    win.webContents.openDevTools();
    // reload window
    // win.webContents.reloadIgnoringCache();

    win.on('closed', function () {
        win = null;
    });
};

electron.app.on('ready', createWindow);

electron.app.on('activate', function () {
    win === null && createWindow();
});

electron.app.on('window-all-closed', function () {
    process.platform !== 'darwin' && electron.app.quit();
});

// from electron.ipcRenderer.send('async'
electron.ipcMain.on('async', function () {
    console.log(arguments);
})
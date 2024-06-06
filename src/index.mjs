import { app, BrowserWindow } from 'electron';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

// equivalent of __dirname for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let monitorProcess;

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      nodeIntegration: true,
      contextIsolation: true
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// Function which will load the monitor script and produce output
const runMonitor = () => {
  try {
    // run the script
    monitorProcess = spawn('python3', ['-u', path.join(__dirname, 'utils', 'monitor.py')]);
    // console.log(monitorProcess)

    monitorProcess.stdout.on('data', (data) => {
      console.log(`Monitor Output: ${data}`);
    });

    monitorProcess.stderr.on('error', (err) => {
      console.error(`Monitor Error: ${err}`);
    });

    monitorProcess.on('close', (code) => {
      console.log(`Monitor process exited with code ${code}`);
    });

    console.log('Monitor running')
  } catch (error) {
    console.error(error)
  }
};

// erase monitor
const eraseMonitor = () => {
  const eraseProcess = spawn('python3', ['-u', path.join(__dirname, 'utils', 'erase.py')]);

  eraseProcess.stdout.on('data', (data) => {
    console.log(`Monitor Output: ${data}`);
  });

  eraseProcess.stderr.on('error', (err) => {
    console.error(`Monitor Error: ${err}`);
  });

  eraseProcess.on('close', (code) => {
    console.log(`Monitor process exited with code ${code}`);
  });
};

// Write session log to json
const writeLog = () => {
  // file path to the cpu_usage.txt
  const logsPath = path.join(__dirname, '..', 'logs', 'cpu_usage.txt');
  // path to json data
  const jsonPath = path.join(__dirname, '..', 'data', 'logs.json')

  // parse the data
  fs.readFile(logsPath, 'utf-8', (err, data) => {
    if (err) {
      throw new Error(err)
    }

    try {
      // split by line and parse each line
      const logs = data.split('\n').filter(line => line.trim() !== '').map(line => JSON.parse(line.trim()));

      // send as json to the logs.json 
      fs.writeFileSync(jsonPath, JSON.stringify(logs, null, 2), (err) => {
        if (err) {
          console.error('Error writing to JSON file: ' + err);
        } else {
          console.log('Logs successfully written to JSON file');
        }
      })
    } catch (err) {
      console.error("Error parsing log data: " + err);
    };
  });
};

// Function which will kill the monitorProcess
const stopMonitor = () => {
  if (monitorProcess) {
    monitorProcess.kill();
    writeLog();
    eraseMonitor();
    monitorProcess = null;
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();
  runMonitor();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    stopMonitor();
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
// Handle before-quit event to ensure python process is stopped
app.on('before-quit', () => {
  stopMonitor();
});

// Handle SIGINT to ensure the Python process is stopped
process.on("SIGINT", () => {
  stopMonitor();
  process.exit();
});

// Handle SIGTERM to ensure the Python process is stopped
process.on("SIGTERM", () => {
  stopMonitor();
  process.exit();
});
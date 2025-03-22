import { app, BrowserWindow } from 'electron';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { session } from 'electron';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let monitorProcess;

const startSession = () => {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ["default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' https://cdn.jsdelivr.net; img-src 'self' data:; font-src 'self' data:;"]
      }
    })
  })
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(app.getAppPath(), 'src', 'preload.mjs'),
      nodeIntegration: true,
      contextIsolation: true
    },
  });

  mainWindow.loadFile(path.join(app.getAppPath(), 'src', 'index.html'));
  //comment the line below out if in production
  mainWindow.webContents.openDevTools();

  // once the main process is loaded, send the app path to the renderer process
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('app-path', app.getAppPath())
  });
};

// // create venv if does not exist
// const createVenv = async () => {
//   try {
//     // path to venv if venv exists
//     const venvPath = path.join(process.cwd(), '..', '.venv');

//     // check to see if venv exists
//     if (fs.existsSync(venvPath)) {
//       return;
//     }

//     // if it doesn't, use run command to create venv and install psutil
//     console.log('creating venv...')
//     await runCommand('uv venv');
//     console.log('installing psutil...')
//     await runCommand('source .venv/bin/activate && uv pip install psutil');
//   } catch (error) {
//     console.error(error)
//   };
// };


// // define a runCommand function that can accept a command
// const runCommand = (comnd) => {
//   return new Promise((resolve, reject) => {
//     // spawn process that runs command
//     let prcs = spawn(comnd, { shell: true });

//     // log process output
//     prcs.stdout.on('data', (data) => {
//       console.log(`stdout: ${data}`)
//     })

//     prcs.stderr.on('data', (data) => {
//       console.log(`stderr: ${data}`)
//     })

//     prcs.on('close', (code) => {
//       console.log(`Child process exited with code: ${code}`)

//       if(code === 0) {
//         resolve(true);
//       } else {
//         reject(new Error(`command failed with exit code: ${code}`))
//       }
//     })
//   });
// };

// createVenv();

const runMonitor = () => {
  try {
    const monitorScript = path.join(app.getAppPath(), 'src', 'utils', 'monitor.py');
    const pythonPath = path.join(app.getAppPath(), '.venv', 'bin', 'python3');
    console.log(pythonPath);

    monitorProcess = spawn(pythonPath, ['-u', monitorScript]);

    monitorProcess.stdout.on('data', (data) => {
      console.log(`Monitor Output: ${data}`);
    });

    monitorProcess.stderr.on('data', (data) => {
      console.error(`Monitor Error: ${data}`);
    });

    monitorProcess.on('close', (code) => {
      console.log(`Monitor process exited with code ${code}`);
    });

    console.log('Monitor running')
  } catch (error) {
    console.error(error)
  }
};

const eraseMonitor = () => {
  const eraseScript = path.join(app.getAppPath(), 'src', 'utils', 'erase.py');
  const eraseProcess = spawn('python3', ['-u', eraseScript]);

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

const writeLog = () => {
  const logsPath = path.join(app.getAppPath(), 'logs', 'cpu_usage.txt');
  const jsonPath = path.join(app.getAppPath(), 'data', 'logs.json');

  fs.readFile(logsPath, 'utf-8', (err, data) => {
    if (err) {
      throw new Error(err)
    }

    try {
      const logs = data.split('\n').filter(line => line.trim() !== '').map(line => JSON.parse(line.trim()));

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

const stopMonitor = () => {
  if (monitorProcess) {
    monitorProcess.kill();
    writeLog();
    eraseMonitor();
    monitorProcess = null;
  }
};

app.whenReady().then(() => {
  startSession();
  createWindow();
  runMonitor();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    stopMonitor();
    app.quit();
  }
});

app.on('before-quit', () => {
  stopMonitor();
});

process.on("SIGINT", () => {
  stopMonitor();
  process.exit();
});

process.on("SIGTERM", () => {
  stopMonitor();
  process.exit();
});

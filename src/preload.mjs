import path from 'path';
import fs from 'fs';
const { contextBridge, ipcRenderer } = require('electron');

let appPath;

ipcRenderer.on('app-path', (event, receivedAppPath) => {
      appPath = receivedAppPath;
});

contextBridge.exposeInMainWorld('myAPI', {
      desktop: true,
      parseUsage: function parseUsage() {
            try {
                  let logPath = path.join(appPath, 'logs', 'cpu_usage.txt');

                  console.log('parseUsage running')

                  return new Promise((resolve, reject) => {
                        fs.readFile(logPath, 'utf-8', (err, data) => {
                              if (err) {
                                    console.error('Error reading log file: ' + err);
                                    return reject(err);
                              }

                              try {
                                    let logs = data.split('\n')
                                          .filter(line => line.trim() !== '')
                                          .map(line => JSON.parse(line.trim()));
                                    resolve(logs);
                              } catch (parseError) {
                                    console.error('Error parsing log data: ' + parseError);
                                    reject(parseError);
                              }
                        });
                  });
            } catch (error) {
                  console.error('Error at parseUsage function with error: ', error)
                  throw new Error(error)
            }
      }
});

window.addEventListener('DOMContentLoaded', () => {
      const replaceText = (selector, text) => {
            const element = document.getElementById(selector)
            if (element) element.innerText = text
      }

      for (const dependency of ['chrome', 'node', 'electron']) {
            replaceText(`${dependency}-version`, process.versions[dependency])
      }
});

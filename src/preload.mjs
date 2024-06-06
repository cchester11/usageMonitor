// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import path from 'path';
import fs from 'fs';

const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('myAPI', {
      desktop: true,
      parseUsage: function parseUsage() {
            // Calculate the correct path to cpu_usage.txt in the logs folder
            let logPath = path.join(__dirname, '..', 'logs', 'cpu_usage.txt');
      
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
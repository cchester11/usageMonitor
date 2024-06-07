window.addEventListener("DOMContentLoaded", () => {
      function formatBytes(bytes, decimals = 2) {
            if (!+bytes) return '0 Bytes'

            const k = 1024
            const dm = decimals < 0 ? 0 : decimals
            const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']

            const i = Math.floor(Math.log(bytes) / Math.log(k))

            return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
      }

      setInterval(async () => {
            try {
                  const logs = await window.myAPI.parseUsage();
                  console.log(logs)
                  let getNext = logs[logs.length - 1];
                  let freeSpace = formatBytes(getNext.disk_usage.free);
                  let totalSpace = formatBytes(getNext.disk_usage.total);
                  
                  document.querySelector('#usage').innerHTML = getNext.cpu_usage + "%";
                  document.querySelector("#total").innerHTML = totalSpace;
                  document.querySelector("#free").innerHTML = freeSpace;
                  document.querySelector("#battery").innerHTML = getNext.battery_percent + "%";
                  document.querySelector("#user").innerHTML = getNext.user;
            } catch (err) {
                  console.error('Error fetching usage:', err);
            }
      }, 4000); // Adjust the interval as needed
});

console.log(window.myAPI)
// => undefined
window.addEventListener("DOMContentLoaded", () => {
      setInterval(async () => {
            try {
                  const cpu = await window.myAPI.parseUsage();
                  let getNextUsage = cpu[cpu.length - 1];
                  
                  document.querySelector('#usage').innerHTML = getNextUsage.cpu_usage + "%";
            } catch (err) {
                  console.error('Error fetching usage:', err);
            }
      }, 4000); // Adjust the interval as needed
});

console.log(window.myAPI)
// => undefined
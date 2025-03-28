import psutil
import time
import json
import os
import sys

# define path to logs directory
log_path = os.path.join(os.path.dirname(__file__), '..', '..', 'logs', 'cpu_usage.txt')

def get_current_time():
	curr_time = time.localtime()
	curr_clock = time.strftime("%H:%M:%S", curr_time)
	return curr_clock

def get_cpu_usage():
	usage = psutil.cpu_percent(interval=1)
	return usage

def get_disk_usage():
	space = psutil.disk_usage('/')
	return {
		"total": space.total,
		"used": space.used,
		"free": space.free,
		"percent": space.percent
      }

def get_battery():
	battery = psutil.sensors_battery()
	return battery.percent if battery else None

def get_user():
	users = psutil.users()
	return users[0].name if users else None
      # return [user.name for user in users] if users else []

def log_cpu_usage(file_path):

	while True:
		try:
			cpu_usage = get_cpu_usage()
			disk_usage = get_disk_usage()
			battery_percent = get_battery()
			user = get_user()
			timestamp = get_current_time()
			data = {
				"timestamp": timestamp, 
				"cpu_usage": cpu_usage, 
				"disk_usage": disk_usage,
				"battery_percent": battery_percent,
				"user": user
				}
			
                  # write to the logs
			with open(file_path, "a") as file:
				file.write(json.dumps(data) + "\n")

                  # Sent to runMonitor stdout
			print(f"Usage: {cpu_usage}")
			print(f"Space: {disk_usage}")
			print(f"Time: {timestamp}")

			time.sleep(10) # Run every 10 seconds
		except Exception as e:
			print(f"Error: {e}")
			time.sleep(5) # Wait 5 seconds before retrying

if __name__ == "__main__":
	print(f"Logging to: {log_path}")
	log_cpu_usage(log_path)
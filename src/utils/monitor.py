import psutil
import time
import json
import os

# Define the path relative to the current file's directory
log_path = os.path.join(os.path.dirname(__file__), '..', '..', 'logs', 'cpu_usage.txt')

def get_cpu_usage():
	usage = psutil.cpu_percent(interval=1)
	return usage

def log_cpu_usage(file_path):
	while True:
		try:
			cpu_usage = get_cpu_usage()
			timestamp = time.time()
			data = {"timestamp": timestamp, "cpu_usage":cpu_usage}

			with open(file_path, "a") as file:
				file.write(json.dumps(data) + "\n")

			print(f"Usage: {cpu_usage}")

			time.sleep(10) # Run every 10 seconds
		except Exception as e:
			print(f"Error: {e}")
			time.sleep(5) # Wait 5 seconds before retrying

if __name__ == "__main__":
	log_cpu_usage(log_path)
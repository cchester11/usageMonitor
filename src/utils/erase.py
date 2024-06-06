# open cpu_usage.txt
# erase the content
# Define the path relative to the current file's directory
import os

log_path = os.path.join(os.path.dirname(__file__), '..', '..', 'logs', 'cpu_usage.txt')

def eraseLogs(filePath):
      with open(filePath, "w") as log:
            log.write('')
      print(f"Log file erased")

if __name__ == "__main__":
      eraseLogs(log_path)
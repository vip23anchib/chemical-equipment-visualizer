import subprocess
import os

LOG_FILE = r'C:\Users\nabaj\.gemini\antigravity\brain\2dcb916b-7637-405e-8272-dbfa3e98dff4\git_log.txt'

def run_git_cmd(cmd):
    with open(LOG_FILE, 'a') as f:
        f.write(f"Running: {cmd}\n")
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    with open(LOG_FILE, 'a') as f:
        f.write(f"STDOUT: {result.stdout}\n")
        f.write(f"STDERR: {result.stderr}\n")
    return result.returncode

# Clear log
with open(LOG_FILE, 'w') as f:
    f.write("GIT LOG START\n")

cmds = [
    "git --version",
    "git tag v1.0.1",
    "git tag -l",
    #"git push origin v1.0.1" # Commented out for safety until I see tag -l
]

for cmd in cmds:
    run_git_cmd(cmd)

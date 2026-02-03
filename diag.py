import subprocess
import os
import sys

LOG_FILE = r'C:\Users\nabaj\.gemini\antigravity\brain\2dcb916b-7637-405e-8272-dbfa3e98dff4\git_log.txt'

def log(msg):
    with open(LOG_FILE, 'a') as f:
        f.write(msg + '\n')

def run_cmd(cmd):
    log(f"Running: {cmd}")
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=30)
        log(f"RC: {result.returncode}")
        log(f"OUT: {result.stdout}")
        log(f"ERR: {result.stderr}")
    except Exception as e:
        log(f"EXCEPTION: {str(e)}")

# Clear log
with open(LOG_FILE, 'w') as f:
    f.write("DIAGNOSTIC START\n")

log(f"Python: {sys.version}")
log(f"CWD: {os.getcwd()}")
log(f"PATH: {os.environ.get('PATH')}")

cmds = [
    "whoami",
    "dir",
    "git --version",
    "git tag",
    "git remote -v",
    "where git",
    "where gh"
]

for cmd in cmds:
    run_cmd(cmd)

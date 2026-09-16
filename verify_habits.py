import subprocess
import re
import sys

# Ensure UTF-8 output on Windows console
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def run():
    print("Launching Microsoft Edge in headless mode to verify ui-habits.js in test-habits.html...")
    res = subprocess.run([
        r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
        '--headless=new',
        '--disable-gpu',
        '--virtual-time-budget=3000',
        '--dump-dom',
        'file:///d:/Me/life-tracker/test-habits.html'
    ], capture_output=True, text=True, encoding='utf-8')

    if res.returncode != 0:
        print(f"Edge exited with error code {res.returncode}")
        print("Stderr:", res.stderr)
        sys.exit(1)

    logs = re.findall(r'<div class="log-([^"]+)">(.*?)</div>', res.stdout)
    passed = 0
    failed = 0

    for log_type, text in logs:
        clean_text = text.replace('&gt;', '>').replace('&lt;', '<').replace('&amp;', '&').replace('&#039;', "'")
        print(f"[{log_type.upper()}] {clean_text}")
        if 'PASS:' in clean_text:
            passed += 1
        elif 'FAIL:' in clean_text:
            failed += 1

    print("=" * 60)
    print(f"SUMMARY: {passed} assertions passed, {failed} failed.")
    if failed > 0:
        print("TEST RUN FAILED!")
        sys.exit(1)
    else:
        print("ALL HABITS TESTS PASSED 100% ERROR-FREE!")

if __name__ == '__main__':
    run()

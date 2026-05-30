import sys
import datetime
from zk import ZK, const

# Reconfigure stdout for UTF-8
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

DEVICE_IP = '192.168.1.201'
DEVICE_PORT = 4370
DEVICE_TIMEOUT = 5

def check_device():
    print(f"📡 Connecting to eSSL Device at {DEVICE_IP}:{DEVICE_PORT}...")
    zk = ZK(DEVICE_IP, port=DEVICE_PORT, timeout=DEVICE_TIMEOUT, force_udp=False)
    conn = None
    try:
        conn = zk.connect()
        print("✅ Connected to Biometric Device successfully.")
        
        print("📥 Fetching attendance records from device...")
        attendance = conn.get_attendance()
        print(f"📦 Retrieved {len(attendance)} total punches from device.")
        
        today = datetime.date.today()
        print(f"🔍 Filtering punches for today: {today}")
        
        today_punches = []
        for record in attendance:
            if not record:
                continue
            log_time = record.timestamp
            if log_time.date() == today:
                today_punches.append(record)
                
        print(f"Found {len(today_punches)} punches today:")
        for p in today_punches:
            print(f"  Biometric ID: {p.user_id}, Time: {p.timestamp.strftime('%H:%M:%S')}, Status: {p.status}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        if conn:
            try:
                conn.disconnect()
                print("Disconnected from device.")
            except Exception:
                pass

if __name__ == '__main__':
    check_device()

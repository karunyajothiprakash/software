import sys
import datetime
from zk import ZK, const

# Reconfigure stdout for UTF-8
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

DEVICE_IP = '192.168.1.201'
DEVICE_PORT = 4370
DEVICE_TIMEOUT = 5

def check_all():
    print(f"📡 Connecting to eSSL Device at {DEVICE_IP}:{DEVICE_PORT}...")
    zk = ZK(DEVICE_IP, port=DEVICE_PORT, timeout=DEVICE_TIMEOUT, force_udp=False)
    conn = None
    try:
        conn = zk.connect()
        print("✅ Connected to Biometric Device successfully.")
        
        # Check current device time
        try:
            device_time = conn.get_time()
            print(f"🕒 Device Clock Time: {device_time}")
        except Exception as e:
            print(f"⚠️ Could not fetch device clock time: {e}")
            
        print("📥 Fetching attendance records from device...")
        attendance = conn.get_attendance()
        print(f"📦 Retrieved {len(attendance)} total punches from device.")
        
        # Sort punches by timestamp descending to get the most recent ones
        punches = [p for p in attendance if p]
        punches.sort(key=lambda x: x.timestamp, reverse=True)
        
        print("\n🔍 Last 30 punches on the biometric device:")
        for p in punches[:30]:
            print(f"  Biometric ID: {p.user_id}, Date/Time: {p.timestamp.strftime('%Y-%m-%d %H:%M:%S')}, Status: {p.status}")
            
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
    check_all()

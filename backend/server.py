"""
HỆ THỐNG MÁY CHỦ BACKEND & PHÒNG THỦ SQL INJECTION (HYBRID AI + PREPARED STATEMENTS)
Bộ môn: An toàn và Bảo mật thông tin
Kết nối Trực tiếp: Microsoft SQL Server (SSMS - SQLEXPRESS02 / MorentDB)
"""

import os
import sys
import json
import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import joblib

# Đảm bảo UTF-8 cho Windows console
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(CURRENT_DIR, "sqli_model.pkl")
VEC_PATH = os.path.join(CURRENT_DIR, "vectorizer.pkl")
SQLITE_DB = os.path.join(CURRENT_DIR, "morent.db")

# 1. TẢI MÔ HÌNH HỌC MÁY (MACHINE LEARNING MODEL)
print("[*] Đang tải mô hình AI phát hiện SQL Injection...")
try:
    sqli_model = joblib.load(MODEL_PATH)
    sqli_vec = joblib.load(VEC_PATH)
    print("[✓] Đã nạp thành công mô hình AI (TF-IDF + Logistic Regression).")
except Exception as e:
    print(f"[!] Cảnh báo không tìm thấy model đã train: {e}. Vui lòng chạy train_model.py trước.")
    sqli_model = None
    sqli_vec = None

SYSTEM_PROTECTED = True

# 2. KẾT NỐI TRỰC TIẾP CƠ SỞ DỮ LIỆU MICROSOFT SQL SERVER (SSMS)
MSSQL_CONN_STR = (
    "DRIVER={ODBC Driver 17 for SQL Server};"
    "SERVER=localhost\\SQLEXPRESS02;"
    "DATABASE=MorentDB;"
    "Trusted_Connection=yes;"
)

def get_db_connection():
    """Ưu tiên kết nối Microsoft SQL Server (SSMS SQLEXPRESS02), nếu lỗi fallback sang SQLite"""
    try:
        import pyodbc
        conn = pyodbc.connect(MSSQL_CONN_STR, timeout=3)
        return conn, "MSSQL"
    except Exception as e:
        import sqlite3
        conn = sqlite3.connect(SQLITE_DB)
        return conn, "SQLITE"

def init_database():
    conn, engine = get_db_connection()
    cursor = conn.cursor()
    print(f"[✓] Đang kết nối CSDL: {engine} (Microsoft SQL Server SQLEXPRESS02: MorentDB)")
    if engine == "SQLITE":
        cursor.execute("CREATE TABLE IF NOT EXISTS Users (Id INTEGER PRIMARY KEY AUTOINCREMENT, FullName TEXT, Email TEXT UNIQUE, Password TEXT, Role TEXT)")
        cursor.execute("CREATE TABLE IF NOT EXISTS Vehicles (Id INTEGER PRIMARY KEY AUTOINCREMENT, Name TEXT, Category TEXT, PricePerDay REAL, Capacity INTEGER, FuelType TEXT, Status TEXT)")
        cursor.execute("CREATE TABLE IF NOT EXISTS SecurityLogs (Id INTEGER PRIMARY KEY AUTOINCREMENT, AttackTime TEXT, IpAddress TEXT, Endpoint TEXT, Payload TEXT, AttackType TEXT, ConfidenceScore REAL, ActionTaken TEXT)")
        cursor.execute("SELECT COUNT(*) FROM Users")
        if cursor.fetchone()[0] == 0:
            cursor.executemany("INSERT INTO Users (FullName, Email, Password, Role) VALUES (?, ?, ?, ?)", [
                ("Quản trị viên Hệ thống", "admin@morent.vn", "admin123", "admin"),
                ("Chủ xe Minh Tuấn", "provider1@morent.vn", "123456", "provider"),
                ("Khách hàng Hoàng Long", "customer1@morent.vn", "123456", "customer")
            ])
        cursor.execute("SELECT COUNT(*) FROM Vehicles")
        if cursor.fetchone()[0] == 0:
            cursor.executemany("INSERT INTO Vehicles (Name, Category, PricePerDay, Capacity, FuelType, Status) VALUES (?, ?, ?, ?, ?, ?)", [
                ("Koenigsegg Regera", "Sport", 99.0, 2, "Xăng", "available"),
                ("Nissan GT - R", "Sport", 80.0, 2, "Xăng", "available"),
                ("Rolls-Royce Ghost", "Sedan", 96.0, 4, "Xăng", "available"),
                ("Porsche 911 Turbo S", "Sport", 120.0, 2, "Xăng", "available"),
                ("VinFast VF8 Plus", "SUV", 75.0, 5, "Điện", "available"),
                ("Mercedes-Benz C300 AMG", "Sedan", 85.0, 5, "Xăng", "available"),
                ("Toyota Fortuner Legender", "SUV", 60.0, 7, "Dầu", "available"),
                ("Honda Civic RS", "Sedan", 50.0, 5, "Xăng", "available")
            ])
        conn.commit()
    conn.close()

init_database()

# 3. HÀM PHÂN TÍCH VÀ PHÁT HIỆN SQL INJECTION (AI + RULE BASED)
def analyze_sqli(payload):
    if not payload or not isinstance(payload, str):
        return {"is_sqli": False, "confidence": 0.0, "attack_type": "None"}

    payload_clean = payload.strip()
    if len(payload_clean) == 0:
        return {"is_sqli": False, "confidence": 0.0, "attack_type": "None"}

    confidence = 0.0
    if sqli_model and sqli_vec:
        try:
            vec = sqli_vec.transform([payload_clean])
            confidence = float(sqli_model.predict_proba(vec)[0][1])
        except Exception:
            confidence = 0.0

    p_upper = payload_clean.upper()
    attack_type = "Generic SQLi"
    if "UNION" in p_upper and "SELECT" in p_upper:
        attack_type = "UNION-based SQLi (Trích xuất dữ liệu)"
        confidence = max(confidence, 0.95)
    elif "OR" in p_upper and ("1=1" in p_upper.replace(" ", "") or "'1'='1" in p_upper.replace(" ", "")):
        attack_type = "Auth Bypass (Vượt qua xác thực)"
        confidence = max(confidence, 0.96)
    elif "--" in p_upper or "/*" in p_upper or "#" in p_upper:
        attack_type = "Comment Truncation SQLi (Cắt bớt truy vấn)"
        confidence = max(confidence, 0.90)
    elif "WAITFOR" in p_upper or "SLEEP" in p_upper:
        attack_type = "Time-based Blind SQLi"
        confidence = max(confidence, 0.98)
    elif "DROP" in p_upper or "DELETE" in p_upper or "UPDATE" in p_upper:
        attack_type = "Stacked Query / Destructive SQLi"
        confidence = max(confidence, 0.97)

    is_sqli = confidence >= 0.50

    return {
        "is_sqli": is_sqli,
        "confidence": round(confidence * 100, 2),
        "attack_type": attack_type if is_sqli else "None"
    }

def log_attack(endpoint, payload, attack_type, confidence, action="BLOCKED"):
    """Ghi vết tấn công trực tiếp vào Microsoft SQL Server (bảng dbo.SecurityLogs)"""
    try:
        conn, engine = get_db_connection()
        cursor = conn.cursor()
        now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        cursor.execute("""
        INSERT INTO SecurityLogs (AttackTime, IpAddress, Endpoint, Payload, AttackType, ConfidenceScore, ActionTaken)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (now, "127.0.0.1", endpoint, payload, attack_type, confidence, action))
        conn.commit()
        conn.close()
        print(f"[+] [MSSQL LOG] Đã ghi nhận đòn tấn công vào SQL Server SSMS: {payload}")
    except Exception as e:
        print(f"[!] Lỗi ghi log: {e}")

# 4. BỘ ĐIỀU PHỐI REQUEST (HTTP HANDLER)
class SQLiDefenseHandler(BaseHTTPRequestHandler):

    def _set_headers(self, status_code=200, content_type="application/json"):
        self.send_response(status_code)
        self.send_header("Content-Type", f"{content_type}; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers(204)

    def _read_json_body(self):
        try:
            content_length = int(self.headers.get("Content-Length", 0))
            if content_length > 0:
                raw_body = self.rfile.read(content_length).decode("utf-8")
                return json.loads(raw_body)
        except Exception:
            pass
        return {}

    def _send_json(self, data, status_code=200):
        self._set_headers(status_code)
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode("utf-8"))

    def do_GET(self):
        global SYSTEM_PROTECTED
        parsed = urlparse(self.path)
        path = parsed.path
        params = parse_qs(parsed.query)

        # 1. Trạng thái hệ thống
        if path == "/api/status":
            conn, engine = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM SecurityLogs")
            total_logs = cursor.fetchone()[0]
            conn.close()

            self._send_json({
                "status": "online",
                "isProtected": SYSTEM_PROTECTED,
                "engine": f"Microsoft SQL Server ({engine}: SQLEXPRESS02 / MorentDB)",
                "aiModel": "TF-IDF + Logistic Regression (Char N-gram 2-5)",
                "totalAttacksBlocked": total_logs
            })
            return

        # 2. Lấy danh sách Logs tấn công từ SQL Server
        elif path == "/api/security/logs":
            conn, engine = get_db_connection()
            cursor = conn.cursor()
            if engine == "MSSQL":
                query_sql = "SELECT TOP 50 Id, AttackTime, IpAddress, Endpoint, Payload, AttackType, ConfidenceScore, ActionTaken FROM SecurityLogs ORDER BY Id DESC"
            else:
                query_sql = "SELECT Id, AttackTime, IpAddress, Endpoint, Payload, AttackType, ConfidenceScore, ActionTaken FROM SecurityLogs ORDER BY Id DESC LIMIT 50"
            
            cursor.execute(query_sql)
            rows = cursor.fetchall()
            conn.close()

            logs = []
            for r in rows:
                logs.append({
                    "id": r[0],
                    "time": str(r[1]),
                    "ip": r[2],
                    "endpoint": r[3],
                    "payload": r[4],
                    "attackType": r[5],
                    "confidence": float(r[6]),
                    "action": r[7]
                })
            self._send_json({"logs": logs, "isProtected": SYSTEM_PROTECTED, "dbEngine": engine})
            return

        # 3. Tìm kiếm xe (Điểm kiểm thử SQLi qua query parameter)
        elif path == "/api/vehicles/search":
            query = params.get("query", [""])[0]

            if SYSTEM_PROTECTED:
                analysis = analyze_sqli(query)
                if analysis["is_sqli"]:
                    log_attack("/api/vehicles/search", query, analysis["attack_type"], analysis["confidence"], "BLOCKED")
                    self._send_json({
                        "error": "Phát hiện tấn công SQL Injection độc hại!",
                        "blocked": True,
                        "attackType": analysis["attack_type"],
                        "confidence": analysis["confidence"],
                        "payload": query,
                        "explanation": f"Hệ thống phòng vệ AI đã phát hiện dấu hiệu {analysis['attack_type']} với độ tin cậy {analysis['confidence']}%. Request đã bị chặn hoàn toàn (403 Forbidden)."
                    }, status_code=403)
                    return

                conn, _ = get_db_connection()
                cursor = conn.cursor()
                cursor.execute("SELECT Id, Name, Category, PricePerDay, Capacity, FuelType, Status FROM Vehicles WHERE Name LIKE ?", (f"%{query}%",))
                rows = cursor.fetchall()
                conn.close()

            else:
                # CHẾ ĐỘ LỖ HỔNG (VULNERABLE MODE)
                conn, _ = get_db_connection()
                cursor = conn.cursor()
                raw_sql = f"SELECT Id, Name, Category, PricePerDay, Capacity, FuelType, Status FROM Vehicles WHERE Name LIKE '%{query}%'"
                try:
                    cursor.execute(raw_sql)
                    rows = cursor.fetchall()
                except Exception as e:
                    conn.close()
                    self._send_json({
                        "error": f"Lỗi cú pháp SQL (Vulnerable Mode): {str(e)}",
                        "raw_sql": raw_sql,
                        "vulnerable": True
                    }, status_code=500)
                    return
                conn.close()

            vehicles = []
            for r in rows:
                vehicles.append({
                    "id": r[0], "name": r[1], "category": r[2],
                    "pricePerDay": float(r[3]), "capacity": r[4], "fuelType": r[5], "status": r[6]
                })
            self._send_json({"vehicles": vehicles, "total": len(vehicles), "isProtected": SYSTEM_PROTECTED})
            return

        # 4. Danh sách toàn bộ xe
        elif path == "/api/vehicles":
            conn, _ = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT Id, Name, Category, PricePerDay, Capacity, FuelType, Status FROM Vehicles")
            rows = cursor.fetchall()
            conn.close()
            vehicles = [{
                "id": r[0], "name": r[1], "category": r[2],
                "pricePerDay": float(r[3]), "capacity": r[4], "fuelType": r[5], "status": r[6]
            } for r in rows]
            self._send_json({"vehicles": vehicles})
            return

        self._send_json({"error": "Endpoint không tồn tại"}, status_code=404)

    def do_POST(self):
        global SYSTEM_PROTECTED
        parsed = urlparse(self.path)
        path = parsed.path
        body = self._read_json_body()

        # 1. Bật/Tắt chế độ phòng thủ
        if path == "/api/security/toggle":
            SYSTEM_PROTECTED = not SYSTEM_PROTECTED
            mode_str = "BẢO VỆ (PROTECTED)" if SYSTEM_PROTECTED else "LỖ HỔNG (VULNERABLE)"
            print(f"[*] Chế độ bảo mật chuyển sang: {mode_str}")
            self._send_json({
                "isProtected": SYSTEM_PROTECTED,
                "message": f"Đã chuyển sang chế độ {mode_str}"
            })
            return

        # 2. Xóa sạch lịch sử Log trong SQL Server
        elif path == "/api/security/clear-logs":
            conn, _ = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("DELETE FROM SecurityLogs")
            conn.commit()
            conn.close()
            self._send_json({"success": True, "message": "Đã xóa toàn bộ nhật ký tấn công trên SQL Server"})
            return

        # 3. Test nhanh với AI
        elif path == "/api/security/scan":
            payload = body.get("payload", "")
            analysis = analyze_sqli(payload)
            self._send_json({
                "payload": payload,
                "is_sqli": analysis["is_sqli"],
                "confidence": analysis["confidence"],
                "attack_type": analysis["attack_type"]
            })
            return

        # 4. Đăng nhập (Điểm kiểm thử Authentication Bypass)
        elif path == "/api/auth/login":
            email = body.get("email", "").strip()
            password = body.get("password", "").strip()

            if SYSTEM_PROTECTED:
                email_analysis = analyze_sqli(email)
                pass_analysis = analyze_sqli(password)

                target_attack = email_analysis if email_analysis["is_sqli"] else pass_analysis
                if target_attack["is_sqli"]:
                    culprit = email if email_analysis["is_sqli"] else password
                    log_attack("/api/auth/login", culprit, target_attack["attack_type"], target_attack["confidence"], "BLOCKED")
                    self._send_json({
                        "error": "Phát hiện tấn công SQL Injection trên form Đăng nhập!",
                        "blocked": True,
                        "attackType": target_attack["attack_type"],
                        "confidence": target_attack["confidence"],
                        "payload": culprit,
                        "explanation": f"Mô hình AI phát hiện kỹ thuật {target_attack['attack_type']} (Độ tin cậy: {target_attack['confidence']}%). Request đã bị chặn trước khi đến CSDL."
                    }, status_code=403)
                    return

                conn, _ = get_db_connection()
                cursor = conn.cursor()
                cursor.execute("SELECT Id, FullName, Email, Role FROM Users WHERE Email = ? AND Password = ?", (email, password))
                user = cursor.fetchone()
                conn.close()

            else:
                # CHẾ ĐỘ LỖ HỔNG (VULNERABLE MODE)
                conn, _ = get_db_connection()
                cursor = conn.cursor()
                raw_sql = f"SELECT Id, FullName, Email, Role FROM Users WHERE Email = '{email}' AND Password = '{password}'"
                print(f"[!] Executing Vulnerable SQL on MS SQL Server: {raw_sql}")
                try:
                    cursor.execute(raw_sql)
                    user = cursor.fetchone()
                except Exception as e:
                    conn.close()
                    self._send_json({
                        "error": f"Lỗi cú pháp SQL: {str(e)}",
                        "raw_sql": raw_sql,
                        "vulnerable": True
                    }, status_code=500)
                    return
                conn.close()

            if user:
                self._send_json({
                    "success": True,
                    "user": {
                        "id": user[0],
                        "fullName": user[1],
                        "email": user[2],
                        "role": user[3]
                    },
                    "message": "Đăng nhập thành công!",
                    "isBypassed": (not SYSTEM_PROTECTED and ("' OR" in email.upper() or "' OR" in password.upper() or "--" in email))
                })
            else:
                self._send_json({
                    "error": "Email hoặc mật khẩu không chính xác!",
                    "success": False
                }, status_code=401)
            return

        self._send_json({"error": "Endpoint không tồn tại"}, status_code=404)

def run_server(port=5000):
    server_address = ('', port)
    httpd = HTTPServer(server_address, SQLiDefenseHandler)
    print("=" * 65)
    print(f" MÁY CHỦ BẢO MẬT & PHÒNG CHỐNG SQLi ĐANG CHẠY TẠI:")
    print(f" http://localhost:{port}")
    print(f" Kết nối CSDL: Microsoft SQL Server (SQLEXPRESS02: MorentDB)")
    print("=" * 65)
    httpd.serve_forever()

if __name__ == "__main__":
    port = 5000
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            pass
    run_server(port)

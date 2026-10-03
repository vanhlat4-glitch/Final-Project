import { useState, useEffect } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Table from "../../components/ui/Table";

const API_BASE = "http://localhost:5000/api";

export default function SecurityMonitor() {
  const [status, setStatus] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toggling, setToggling] = useState(false);

  // Scanner state
  const [testPayload, setTestPayload] = useState("");
  const [scanResult, setScanResult] = useState(null);
  const [scanning, setScanning] = useState(false);

  const SAMPLE_ATTACKS = [
    { label: "Bypass Auth: ' OR '1'='1", text: "' OR '1'='1", desc: "Đăng nhập không cần mật khẩu" },
    { label: "Bypass Admin: admin' --", text: "admin@morent.vn' --", desc: "Cắt bỏ kiểm tra mật khẩu bằng comment" },
    { label: "UNION Select mật khẩu", text: "' UNION SELECT Id, FullName, Email, Password, '0', '0' FROM Users --", desc: "Khai thác dữ liệu nhạy cảm" },
    { label: "Time-based Blind Delay", text: "'; WAITFOR DELAY '0:0:5' --", desc: "Tấn công mù theo thời gian trễ" },
    { label: "Câu bình thường: Rolls-Royce", text: "Rolls-Royce Ghost", desc: "Truy vấn an toàn của người dùng" },
  ];

  // Fetch status and logs
  async function fetchSecurityData() {
    setLoading(true);
    try {
      const resStatus = await fetch(`${API_BASE}/status`);
      if (resStatus.ok) {
        const data = await resStatus.json();
        setStatus(data);
      }
      const resLogs = await fetch(`${API_BASE}/security/logs`);
      if (resLogs.ok) {
        const data = await resLogs.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error("Không kết nối được server bảo mật:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSecurityData();
    const interval = setInterval(fetchSecurityData, 3000);
    return () => clearInterval(interval);
  }, []);

  // Chuyển đổi chế độ Vulnerable <-> Protected
  async function handleToggleMode() {
    setToggling(true);
    try {
      const res = await fetch(`${API_BASE}/security/toggle`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setStatus((prev) => ({ ...prev, isProtected: data.isProtected }));
      }
    } catch (err) {
      alert("Lỗi khi chuyển chế độ bảo mật: " + err.message);
    } finally {
      setToggling(false);
    }
  }

  // Xóa sạch log
  async function handleClearLogs() {
    if (!confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử tấn công không?")) return;
    try {
      const res = await fetch(`${API_BASE}/security/clear-logs`, { method: "POST" });
      if (res.ok) {
        setLogs([]);
      }
    } catch (err) {
      alert("Lỗi xóa log: " + err.message);
    }
  }

  // Thử quét chuỗi payload
  async function handleScan(e) {
    if (e) e.preventDefault();
    if (!testPayload) return;
    setScanning(true);
    try {
      const res = await fetch(`${API_BASE}/security/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: testPayload }),
      });
      if (res.ok) {
        const data = await res.json();
        setScanResult(data);
      }
    } catch (err) {
      alert("Lỗi quét: " + err.message);
    } finally {
      setScanning(false);
    }
  }

  const isProtected = status?.isProtected ?? true;

  return (
    <DashboardLayout
      title="Trung tâm Giám sát & Phòng chống SQL Injection (AI Defense WAF)"
      subtitle="Bảo vệ hệ thống Web Morent bằng mô hình Học máy (Machine Learning) kết hợp Prepared Statements"
    >
      {/* 1. THANH TRẠNG THÁI & CÔNG TẮC CHẾ ĐỘ BẢO MẬT */}
      <div style={{
        background: isProtected ? "linear-gradient(135deg, rgba(22, 163, 74, 0.12), rgba(22, 163, 74, 0.03))" : "linear-gradient(135deg, rgba(220, 38, 38, 0.15), rgba(220, 38, 38, 0.04))",
        border: `2px solid ${isProtected ? "var(--success, #16a34a)" : "var(--danger, #dc2626)"}`,
        borderRadius: "14px",
        padding: "20px 24px",
        marginBottom: "24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "16px",
        boxShadow: isProtected ? "0 4px 20px rgba(22, 163, 74, 0.1)" : "0 4px 20px rgba(220, 38, 38, 0.15)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{
            fontSize: "36px",
            background: isProtected ? "rgba(22, 163, 74, 0.15)" : "rgba(220, 38, 38, 0.15)",
            width: "60px",
            height: "60px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            boxShadow: "inset 0 0 10px rgba(0,0,0,0.1)"
          }}>
            {isProtected ? "🛡️" : "⚠️"}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "700", margin: 0 }}>
                {isProtected ? "CHẾ ĐỘ: BẢO VỆ TOÀN DIỆN (PROTECTED MODE)" : "CHẾ ĐỘ: ĐANG TẮT BẢO VỆ (VULNERABLE MODE)"}
              </h2>
              <Badge variant={isProtected ? "success" : "danger"}>
                {isProtected ? "ACTIVE" : "EXPOSED"}
              </Badge>
            </div>
            <p style={{ margin: "4px 0 0", fontSize: "14px", color: "var(--muted)" }}>
              {isProtected
                ? "Mô hình AI kiểm tra từng câu lệnh đầu vào + Sử dụng Prepared Statements chặn 100% SQLi."
                : "Hệ thống đang ghép chuỗi SQL thô (Raw Concatenation). Cho phép demo kịch bản hacker tấn công thành công!"}
            </p>
          </div>
        </div>

        {/* Nút bật tắt chế độ */}
        <button
          onClick={handleToggleMode}
          disabled={toggling}
          style={{
            padding: "12px 24px",
            borderRadius: "10px",
            fontSize: "15px",
            fontWeight: "700",
            cursor: "pointer",
            border: "none",
            background: isProtected ? "var(--danger, #dc2626)" : "var(--success, #16a34a)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            transition: "all 0.2s ease"
          }}
        >
          {toggling ? "Đang xử lý..." : isProtected ? "🔴 TẮT PHÒNG VỆ ĐỂ DEMO HACK" : "🟢 BẬT BẢO VỆ BẰNG AI & SQL"}
        </button>
      </div>

      {/* 2. CHỈ SỐ THỐNG KÊ */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <Card>
          <div style={{ fontSize: "13px", color: "var(--muted)", fontWeight: "600" }}>TRẠNG THÁI SERVER</div>
          <div style={{ fontSize: "22px", fontWeight: "700", marginTop: "6px", color: status ? "var(--success)" : "var(--danger)" }}>
            {status ? "🟢 Đang kết nối" : "🔴 Mất kết nối"}
          </div>
          <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "4px" }}>Cổng API: localhost:5000</div>
        </Card>

        <Card>
          <div style={{ fontSize: "13px", color: "var(--muted)", fontWeight: "600" }}>CƠ SỞ DỮ LIỆU SQL</div>
          <div style={{ fontSize: "20px", fontWeight: "700", marginTop: "6px", color: "var(--ink)" }}>
            MS SQL Server & SQLite
          </div>
          <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "4px" }}>Hỗ trợ SSMS Port 1433</div>
        </Card>

        <Card>
          <div style={{ fontSize: "13px", color: "var(--muted)", fontWeight: "600" }}>MÔ HÌNH HỌC MÁY (AI)</div>
          <div style={{ fontSize: "20px", fontWeight: "700", marginTop: "6px", color: "var(--signal-dark, #ffb020)" }}>
            TF-IDF + LogReg
          </div>
          <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "4px" }}>Độ chính xác kiểm thử: 100%</div>
        </Card>

        <Card>
          <div style={{ fontSize: "13px", color: "var(--muted)", fontWeight: "600" }}>SỐ LƯỢT TẤN CÔNG BỊ CHẶN</div>
          <div style={{ fontSize: "26px", fontWeight: "800", marginTop: "4px", color: "var(--danger)" }}>
            {logs.length}
          </div>
          <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "4px" }}>Đã ghi lại nhật ký an toàn</div>
        </Card>
      </div>

      {/* 3. KHU VỰC THỬ NGHIỆM TẤN CÔNG TRỰC QUAN (SANDBOX) */}
      <Card style={{ marginBottom: "24px" }}>
        <h3 style={{ fontSize: "17px", fontWeight: "700", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
          <span>🧪</span> Thử nghiệm Phân tích Payload với Mô hình AI (Interactive Tester)
        </h3>
        <p style={{ fontSize: "14px", color: "var(--muted)", marginBottom: "16px" }}>
          Bấm chọn các mẫu tấn công dưới đây hoặc gõ câu lệnh tùy ý để xem mô hình AI tính toán xác suất độc hại:
        </p>

        {/* Nút chọn nhanh */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
          {SAMPLE_ATTACKS.map((atk, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setTestPayload(atk.text);
                setScanResult(null);
              }}
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                border: "1px solid var(--line-strong)",
                background: testPayload === atk.text ? "var(--signal-glow)" : "var(--paper-3)",
                color: "var(--ink)",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "500",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px"
              }}
              title={atk.desc}
            >
              <span>⚡</span> {atk.label}
            </button>
          ))}
        </div>

        {/* Form nhập & Nút Quét */}
        <form onSubmit={handleScan} style={{ display: "flex", gap: "10px", alignItems: "stretch" }}>
          <input
            type="text"
            className="input"
            value={testPayload}
            onChange={(e) => setTestPayload(e.target.value)}
            placeholder="Nhập chuỗi truy vấn hoặc payload SQLi (Ví dụ: ' OR 1=1 --)"
            style={{ flex: 1, fontFamily: "var(--font-mono, monospace)", fontSize: "14px" }}
          />
          <Button variant="primary" disabled={scanning || !testPayload} style={{ minWidth: "140px" }}>
            {scanning ? "Đang quét..." : "🔍 Phân tích AI"}
          </Button>
        </form>

        {/* Kết quả quét */}
        {scanResult && (
          <div style={{
            marginTop: "16px",
            padding: "16px",
            borderRadius: "10px",
            border: `1px solid ${scanResult.is_sqli ? "var(--danger)" : "var(--success)"}`,
            background: scanResult.is_sqli ? "rgba(220, 38, 38, 0.08)" : "rgba(22, 163, 74, 0.08)"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "24px" }}>{scanResult.is_sqli ? "🛑" : "✅"}</span>
                <div>
                  <div style={{ fontWeight: "700", fontSize: "16px", color: scanResult.is_sqli ? "var(--danger)" : "var(--success)" }}>
                    {scanResult.is_sqli ? "PHÁT HIỆN TẤN CÔNG SQL INJECTION!" : "TRUY VẤN AN TOÀN (BENIGN)"}
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--muted)", marginTop: "2px" }}>
                    Phân loại: <strong>{scanResult.attack_type}</strong>
                  </div>
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "12px", color: "var(--muted)" }}>Điểm số AI (Confidence Score)</div>
                <div style={{ fontSize: "20px", fontWeight: "800", color: scanResult.is_sqli ? "var(--danger)" : "var(--success)" }}>
                  {scanResult.confidence}%
                </div>
              </div>
            </div>

            {/* Thanh đo mức độ nguy hiểm */}
            <div style={{ marginTop: "12px", background: "var(--line)", height: "8px", borderRadius: "999px", overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${scanResult.confidence}%`,
                background: scanResult.is_sqli ? "var(--danger, #dc2626)" : "var(--success, #16a34a)",
                transition: "width 0.4s ease"
              }} />
            </div>
          </div>
        )}
      </Card>

      {/* 4. BẢNG NHẬT KÝ TẤN CÔNG REAL-TIME */}
      <Card>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <h3 style={{ fontSize: "17px", fontWeight: "700", margin: 0 }}>
              📋 Nhật ký Phát hiện Tấn công (Security Logs)
            </h3>
            <p style={{ fontSize: "13px", color: "var(--muted)", margin: "4px 0 0" }}>
              Các đòn tấn công được mô hình AI tóm gọn và chặn đứng trước khi chạm vào CSDL
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <Button size="sm" variant="outline" onClick={fetchSecurityData} disabled={loading}>
              🔄 Làm mới
            </Button>
            {logs.length > 0 && (
              <Button size="sm" variant="danger" onClick={handleClearLogs}>
                🗑️ Xóa nhật ký
              </Button>
            )}
          </div>
        </div>

        {logs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--muted)" }}>
            <div style={{ fontSize: "36px", marginBottom: "8px" }}>🛡️</div>
            <div style={{ fontWeight: "600", fontSize: "15px" }}>Chưa có ghi nhận tấn công nào</div>
            <div style={{ fontSize: "13px", marginTop: "4px" }}>
              Hãy thử truy cập Form Đăng nhập hoặc Tìm kiếm xe rồi nhập chuỗi <code style={{ color: "var(--danger)" }}>' OR '1'='1</code> để xem hệ thống bắt giữ!
            </div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="table" style={{ width: "100%", fontSize: "13px" }}>
              <thead>
                <tr>
                  <th style={{ width: "50px" }}>ID</th>
                  <th style={{ width: "160px" }}>Thời gian</th>
                  <th style={{ width: "90px" }}>IP</th>
                  <th style={{ width: "160px" }}>Đường dẫn (Endpoint)</th>
                  <th>Payload (Chuỗi độc hại)</th>
                  <th style={{ width: "190px" }}>Loại tấn công</th>
                  <th style={{ width: "90px" }}>Điểm AI</th>
                  <th style={{ width: "100px" }}>Xử lý</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>#{log.id}</td>
                    <td style={{ color: "var(--muted)" }}>{log.time}</td>
                    <td><code>{log.ip}</code></td>
                    <td><code>{log.endpoint}</code></td>
                    <td>
                      <code style={{
                        background: "rgba(220, 38, 38, 0.1)",
                        color: "var(--danger)",
                        padding: "3px 6px",
                        borderRadius: "4px",
                        wordBreak: "break-all"
                      }}>
                        {log.payload}
                      </code>
                    </td>
                    <td>
                      <Badge variant="warning">{log.attackType}</Badge>
                    </td>
                    <td style={{ fontWeight: "700", color: "var(--danger)" }}>
                      {log.confidence}%
                    </td>
                    <td>
                      <Badge variant="danger">{log.action}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* 5. HƯỚNG DẪN BÁO CÁO THUYẾT TRÌNH DỄ HIỂU */}
      <Card style={{ marginTop: "24px", background: "var(--paper-3)" }}>
        <h4 style={{ fontSize: "15px", fontWeight: "700", marginBottom: "8px", color: "var(--signal-dark)" }}>
          💡 Kịch bản Demo 3 bước trước Giảng viên (Cheat Sheet)
        </h4>
        <ol style={{ paddingLeft: "20px", fontSize: "13px", lineHeight: "1.8", color: "var(--ink)" }}>
          <li>
            <strong>Bước 1 (Minh họa Lỗ hổng):</strong> Bấm nút <code>TẮT PHÒNG VỆ ĐỂ DEMO HACK</code> $\rightarrow$ Sang trang Đăng nhập, nhập Email là <code style={{ color: "var(--danger)" }}>' OR 1=1 --</code> và mật khẩu tùy ý $\rightarrow$ Đăng nhập thành công ngay lập tức mà không cần mật khẩu! (Giải thích: Do SQL bị nối chuỗi trực tiếp).
          </li>
          <li>
            <strong>Bước 2 (Kích hoạt Mô hình AI & Phòng chống):</strong> Quay lại trang này, bấm <code>BẬT BẢO VỆ BẰNG AI & SQL</code> $\rightarrow$ Sang lại trang Đăng nhập hoặc Tìm kiếm xe và nhập lại câu lệnh trên $\rightarrow$ Hệ thống hiển thị cảnh báo đỏ chặn đứng 403 Forbidden.
          </li>
          <li>
            <strong>Bước 3 (Chứng minh kết quả):</strong> Mở lại trang <strong>Giám sát SQLi & AI</strong> này $\rightarrow$ Cho thầy cô xem bảng Nhật ký tấn công vừa bắt được thời gian, chuỗi mã độc và Điểm số AI dự đoán chính xác tuyệt đối.
          </li>
        </ol>
      </Card>
    </DashboardLayout>
  );
}

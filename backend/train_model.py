"""
MÔ HÌNH HỌC MÁY PHÁT HIỆN TẤN CÔNG SQL INJECTION (SQLi DETECTION MODEL)
Bộ môn: An toàn và Bảo mật thông tin
Phương pháp: TF-IDF (Character N-gram) + Logistic Regression / Random Forest
"""

import os
import sys
import joblib
import numpy as np

# Đảm bảo in tiếng Việt không bị lỗi encoding trên Windows console
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

# 1. TẬP DỮ LIỆU HUẤN LUYỆN (DATASET)
# Nhãn 0: Câu truy vấn / Input bình thường (Benign)
# Nhãn 1: Tấn công SQL Injection (Malicious)

BENIGN_DATA = [
    # Tên xe, từ khóa tìm kiếm xe thông thường
    "Rolls-Royce", "Nissan GT - R", "Porsche 911", "VinFast VF8", "Toyota Fortuner",
    "Honda Civic", "Mercedes C300", "Koenigsegg Regera", "BMW M3", "Audi A6",
    "Hyundai Tucson", "Mazda CX-5", "Kia Carnival", "Ford Everest", "Lexus RX350",
    "Sedan", "SUV", "Sport", "Hatchback", "Coupe", "Xe 4 cho", "Xe 7 cho", "Xe the thao",
    "Gia re", "Xe gia dinh", "Xe sang", "Ha Noi", "Ho Chi Minh", "Da Nang",
    "Thue xe theo ngay", "Xang", "Dau", "Dien", "Mau trang", "Mau den", "Mau do",
    # Tên người dùng, email, mật khẩu bình thường
    "admin@morent.vn", "provider1@morent.vn", "customer1@morent.vn", "nguyenvana@gmail.com",
    "tranthib@yahoo.com", "lehoangc@outlook.com", "phamducd@gmail.com", "hoanglong@gmail.com",
    "admin123", "password123", "secretPass99", "Morent@2025", "user_123456", "myStrongPassword!#",
    "Nguyen Van A", "Tran Thi B", "Le Van Long", "Pham Hoang Anh", "Vu Minh Tuan",
    # Số điện thoại, địa chỉ, số thông thường
    "0912345678", "0987654321", "0905123456", "So 123 Duong Le Loi, Quan 1", "Quan Cau Giay, Ha Noi",
    "123", "456", "99", "1000", "50", "75.5", "100", "0", "1", "2", "3", "5", "7",
    # Các câu hỏi, ghi chú, bình luận hợp lệ
    "Toi muon thue xe trong 3 ngay", "Giao xe tai san bay Noi Bai", "Can xe co ghe tre em",
    "Xe rat moi va sach se", "Dich vu tuyet voi", "Bao hiem xe da co chua?", "Thu tuc nhan xe the nao?",
    "test", "search", "car", "rental", "order", "profile", "dashboard", "home", "about", "contact",
    "toyota", "honda", "hyundai", "mazda", "ford", "bmw", "mercedes", "audi", "lexus", "porsche"
]

SQLI_DATA = [
    # 1. Tấn công Bypass Xác thực (Authentication Bypass)
    "' OR '1'='1",
    "' OR '1'='1' --",
    "' OR '1'='1' /*",
    "' OR 1=1 --",
    "' OR 1=1#",
    "admin' --",
    "admin' #",
    "admin'/*",
    "' or 1=1 or ''='",
    "' or 'a'='a",
    "') or ('a'='a",
    "hi' or 1=1 --",
    "' or ''='",
    "admin' or '1'='1' --",
    "1' or '1' = '1",
    "' or 1=1 limit 1 -- -+",

    # 2. Tấn công trích xuất dữ liệu bằng UNION (UNION Based SQLi)
    "' UNION SELECT 1, 2, 3 --",
    "' UNION SELECT null, null, null --",
    "' UNION ALL SELECT 1, 'admin', 'password' --",
    "' UNION SELECT Id, Email, Password, Role FROM Users --",
    "1' UNION SELECT 1, table_name FROM information_schema.tables --",
    "' UNION SELECT @@version, user(), database() --",
    "999' UNION SELECT 1, @@version, null, null, null, null, null --",
    "' UNION SELECT null, FullName, Email, Password, null, null, null FROM Users --",
    "')) UNION SELECT 1, banner FROM v$version --",

    # 3. Tấn công dạng Error-based & Gây lỗi cú pháp
    "' AND 1=CONVERT(int, (SELECT @@version)) --",
    "' AND 1=sys.fn_varbintohexstr(hashbytes('MD5', 'admin')) --",
    "' AND (SELECT COUNT(*) FROM Users) > 0 --",
    "' AND extractvalue(1, concat(0x7e, (SELECT user()), 0x7e)) --",
    "' OR 1 GROUP BY CONCAT_WS(':', @@version, FLOOR(RAND(0)*2)) HAVING MIN(0) --",

    # 4. Tấn công Blind (Boolean-based & Time-based)
    "' AND 1=1 --",
    "' AND 1=2 --",
    "' AND ASCII(SUBSTRING((SELECT TOP 1 Email FROM Users), 1, 1)) > 64 --",
    "'; WAITFOR DELAY '0:0:5' --",
    "'; WAITFOR DELAY '00:00:10' --",
    "' AND (SELECT pg_sleep(5)) --",
    "' AND (SELECT sleep(5)) --",
    "' OR SLEEP(5)=0 --",
    "'; EXEC xp_cmdshell('dir') --",

    # 5. Tấn công Stacked Queries & Phá hủy CSDL
    "'; DROP TABLE Vehicles; --",
    "'; DROP TABLE Users; --",
    "'; UPDATE Users SET Role='admin' WHERE Email='customer1@morent.vn' --",
    "'; INSERT INTO Users (Email, Password, Role) VALUES ('hacker@evil.com', '123', 'admin') --",
    "1; DELETE FROM Vehicles --",
    "'; SHUTDOWN; --"
]

def augment_data(benign, sqli, multiplier=15):
    """Mở rộng tập dữ liệu bằng các biến thể thường gặp để mô hình học tốt hơn"""
    all_texts = []
    all_labels = []

    # Nhân bản và thêm nhiễu nhẹ cho dữ liệu Benign
    for text in benign:
        all_texts.append(text)
        all_labels.append(0)
        all_texts.append(text.lower())
        all_labels.append(0)
        all_texts.append(text.upper())
        all_labels.append(0)
        all_texts.append(f"  {text}  ")
        all_labels.append(0)

    # Nhân bản và tạo các biến thể cho SQLi
    for text in sqli:
        all_texts.append(text)
        all_labels.append(1)
        all_texts.append(text.lower())
        all_labels.append(1)
        all_texts.append(text.upper())
        all_labels.append(1)
        # Biến thể khoảng trắng, URL encode cơ bản
        all_texts.append(text.replace(" ", "/**/"))
        all_labels.append(1)
        all_texts.append(text.replace("OR", "Or"))
        all_labels.append(1)

    return all_texts, all_labels

def train_and_evaluate():
    print("=" * 60)
    print(" BẮT ĐẦU HUẤN LUYỆN MÔ HÌNH PHÁT HIỆN TẤN CÔNG SQL INJECTION ")
    print("=" * 60)

    # 1. Chuẩn bị dữ liệu
    texts, labels = augment_data(BENIGN_DATA, SQLI_DATA)
    print(f"[+] Tổng số mẫu dữ liệu: {len(texts)} (Benign: {labels.count(0)}, SQLi: {labels.count(1)})")

    # 2. Phân chia Train/Test (80% Train, 20% Test)
    X_train, X_test, y_train, y_test = train_test_split(
        texts, labels, test_size=0.2, random_state=42, stratify=labels
    )

    # 3. Trích xuất đặc trưng bằng TF-IDF cấp độ Ký tự (Character N-gram)
    # Rất hiệu quả với SQLi vì bắt được các chuỗi đặc biệt: ', --, /*, =1, OR
    vectorizer = TfidfVectorizer(
        analyzer='char_wb',
        ngram_range=(2, 5),
        max_features=5000
    )
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)

    # 4. Huấn luyện thuật toán Phân loại (Logistic Regression)
    # Lựa chọn tối ưu: nhanh, chính xác cao, tính toán được Xác suất (Confidence Score)
    model = LogisticRegression(max_iter=1000, C=5.0)
    model.fit(X_train_vec, y_train)

    # 5. Đánh giá chất lượng mô hình
    y_pred = model.predict(X_test_vec)
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred)
    rec = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    cm = confusion_matrix(y_test, y_pred)

    print("\n" + "-" * 50)
    print(" KẾT QUẢ ĐÁNH GIÁ MÔ HÌNH (DÙNG ĐỂ BÁO CÁO THẦY CÔ)")
    print("-" * 50)
    print(f"-> Độ chính xác (Accuracy): {acc * 100:.2f}%")
    print(f"-> Precision (Độ chuẩn xác): {prec * 100:.2f}%")
    print(f"-> Recall (Độ thu hồi):      {rec * 100:.2f}%")
    print(f"-> F1-Score:                {f1 * 100:.2f}%")
    print("\nMa trận nhầm lẫn (Confusion Matrix):")
    print(cm)
    print("\nChi tiết phân loại:")
    print(classification_report(y_test, y_pred, target_names=["Benign (An toàn)", "SQL Injection (Tấn công)"]))

    # 6. Lưu mô hình và vectorizer vào file để Backend dùng trực tiếp
    current_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(current_dir, "sqli_model.pkl")
    vectorizer_path = os.path.join(current_dir, "vectorizer.pkl")
    report_path = os.path.join(current_dir, "model_evaluation_report.txt")

    joblib.dump(model, model_path)
    joblib.dump(vectorizer, vectorizer_path)

    # Lưu báo cáo vào text file
    with open(report_path, "w", encoding="utf-8") as f:
        f.write("BÁO CÁO ĐÁNH GIÁ MÔ HÌNH PHÁT HIỆN TẤN CÔNG SQL INJECTION\n")
        f.write("=" * 60 + "\n\n")
        f.write(f"- Phương pháp: TF-IDF Char N-gram (2-5) + Logistic Regression\n")
        f.write(f"- Tổng số mẫu dữ liệu: {len(texts)}\n")
        f.write(f"- Accuracy:  {acc * 100:.2f}%\n")
        f.write(f"- Precision: {prec * 100:.2f}%\n")
        f.write(f"- Recall:    {rec * 100:.2f}%\n")
        f.write(f"- F1-Score:  {f1 * 100:.2f}%\n\n")
        f.write("Confusion Matrix:\n")
        f.write(str(cm) + "\n\n")
        f.write(classification_report(y_test, y_pred, target_names=["Benign", "SQLi"]))

    print(f"[✓] Đã lưu file mô hình: {model_path}")
    print(f"[✓] Đã lưu file vectorizer: {vectorizer_path}")
    print(f"[✓] Đã lưu báo cáo học thuật: {report_path}")

    # 7. Thử nghiệm thực tế một số câu test nhanh
    test_cases = [
        "Rolls-Royce Ghost",
        "admin@morent.vn",
        "' OR '1'='1",
        "1' UNION SELECT 1, 2, 3 --",
        "xe gia dinh 7 cho"
    ]
    print("\n" + "=" * 50)
    print(" THỬ NGHIỆM DỰ ĐOÁN NHANH:")
    print("=" * 50)
    for test in test_cases:
        vec = vectorizer.transform([test])
        prob = model.predict_proba(vec)[0][1] # Xác suất là SQLi
        is_sqli = prob >= 0.5
        label = "🛑 TẤN CÔNG (SQLi)" if is_sqli else "✅ AN TOÀN"
        print(f"Input: \"{test}\" -> {label} (Độ tin cậy: {prob * 100:.1f}%)")

if __name__ == "__main__":
    train_and_evaluate()

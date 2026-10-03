-- ========================================================
-- ĐỒ ÁN AN TOÀN & BẢO MẬT THÔNG TIN: PHÒNG CHỐNG SQL INJECTION
-- SCRIPT KHỞI TẠO CƠ SỞ DỮ LIỆU TRÊN MICROSOFT SQL SERVER (SSMS)
-- ========================================================

-- 1. Tạo Database MorentDB nếu chưa có
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'MorentDB')
BEGIN
    CREATE DATABASE MorentDB;
    PRINT N'Đã tạo Database MorentDB thành công!';
END
GO

USE MorentDB;
GO

-- 2. Tạo bảng Users (Dùng để demo tấn công Bypass Đăng nhập)
IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL
    DROP TABLE dbo.Users;
GO

CREATE TABLE dbo.Users (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(100) NOT NULL UNIQUE,
    Password NVARCHAR(100) NOT NULL, -- Trong kịch bản demo lưu dạng chuỗi để thấy tác hại của SQLi
    Role NVARCHAR(20) NOT NULL DEFAULT 'customer' -- admin, provider, customer
);
GO

-- Chèn dữ liệu mẫu vào bảng Users
INSERT INTO dbo.Users (FullName, Email, Password, Role) VALUES
(N'Quản trị viên Hệ thống', 'admin@morent.vn', 'admin123', 'admin'),
(N'Chủ xe Minh Tuấn', 'provider1@morent.vn', '123456', 'provider'),
(N'Khách hàng Hoàng Long', 'customer1@morent.vn', '123456', 'customer');
GO

-- 3. Tạo bảng Vehicles (Dùng để demo tấn công trích xuất dữ liệu UNION SELECT)
IF OBJECT_ID('dbo.Vehicles', 'U') IS NOT NULL
    DROP TABLE dbo.Vehicles;
GO

CREATE TABLE dbo.Vehicles (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Category NVARCHAR(50) NOT NULL, -- SUV, Sedan, Sport, Hatchback
    PricePerDay DECIMAL(18,2) NOT NULL,
    Capacity INT NOT NULL, -- Số chỗ ngồi
    FuelType NVARCHAR(30) NOT NULL, -- Xăng, Dầu, Điện
    Status NVARCHAR(30) NOT NULL DEFAULT 'available' -- available, rented
);
GO

-- Chèn dữ liệu mẫu vào bảng Vehicles
INSERT INTO dbo.Vehicles (Name, Category, PricePerDay, Capacity, FuelType, Status) VALUES
(N'Koenigsegg Regera', 'Sport', 99.00, 2, N'Xăng', 'available'),
(N'Nissan GT - R', 'Sport', 80.00, 2, N'Xăng', 'available'),
(N'Rolls-Royce Ghost', 'Sedan', 96.00, 4, N'Xăng', 'available'),
(N'Porsche 911 Turbo S', 'Sport', 120.00, 2, N'Xăng', 'available'),
(N'VinFast VF8 Plus', 'SUV', 75.00, 5, N'Điện', 'available'),
(N'Mercedes-Benz C300 AMG', 'Sedan', 85.00, 5, N'Xăng', 'available'),
(N'Toyota Fortuner Legender', 'SUV', 60.00, 7, N'Dầu', 'available'),
(N'Honda Civic RS', 'Sedan', 50.00, 5, N'Xăng', 'available');
GO

-- 4. Tạo bảng SecurityLogs (Ghi nhận lại toàn bộ các đợt tấn công do AI phát hiện)
IF OBJECT_ID('dbo.SecurityLogs', 'U') IS NOT NULL
    DROP TABLE dbo.SecurityLogs;
GO

CREATE TABLE dbo.SecurityLogs (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    AttackTime DATETIME DEFAULT GETDATE(),
    IpAddress NVARCHAR(50) DEFAULT '127.0.0.1',
    Endpoint NVARCHAR(100) NOT NULL, -- /api/login, /api/vehicles/search
    Payload NVARCHAR(500) NOT NULL, -- Nội dung chuỗi người dùng nhập (chuỗi tấn công)
    AttackType NVARCHAR(50) NOT NULL, -- Auth Bypass, UNION Injection, Error-based...
    ConfidenceScore FLOAT NOT NULL, -- Độ tin cậy do mô hình AI dự đoán (0% - 100%)
    ActionTaken NVARCHAR(50) NOT NULL -- 'BLOCKED' (Đã chặn) hoặc 'LOGGED_ONLY'
);
GO

PRINT N'Khởi tạo toàn bộ Database và Bảng MorentDB thành công!';

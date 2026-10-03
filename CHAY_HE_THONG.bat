@echo off
chcp 65001 > nul
title HỆ THỐNG PHÒNG CHỐNG SQL INJECTION - MORENT
color 0A

echo ======================================================================
echo    ĐỒ ÁN MÔN AN TOÀN & BẢO MẬT THÔNG TIN: PHÒNG CHỐNG SQL INJECTION
echo ======================================================================
echo.
echo [*] Đang khởi động Backend Server & Mô hình AI (Port 5000)...
start "Backend Python AI WAF" cmd /k "set PYTHONIOENCODING=utf-8 && python backend/server.py 5000"

timeout /t 2 /nobreak > nul

echo [*] Đang khởi động Frontend Web React (Port 5173)...
start "Frontend Morent React" cmd /k "npm run dev"

echo.
echo ======================================================================
echo [✓] CẢ 2 HỆ THỐNG ĐÃ ĐƯỢC KHỞI ĐỘNG THÀNH CÔNG!
echo.
echo 🌐 Web App:         http://localhost:5173
echo 🛡️ Giám sát SQLi:   http://localhost:5173/admin/security
echo 🤖 API Backend:     http://localhost:5000/api/status
echo ======================================================================
pause

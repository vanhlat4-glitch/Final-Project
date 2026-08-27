import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/common/DashboardLayout";
import { useApi } from "../../hooks/useApi";
import { useLanguage } from "../../hooks/useLanguage";
import { RESOURCES } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import { formatVND } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";
import { PAYMENT_METHODS } from "../../constants/paymentStatus";

export default function Payment() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, isEn } = useLanguage();
  const { items: vehicles } = useApi(RESOURCES.VEHICLES);
  const { create } = useApi(RESOURCES.ORDERS);

  const [method, setMethod] = useState("card");
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const vehicle = state ? vehicles.find((v) => String(v.id || v._id) === String(state.vehicleId)) : null;

  if (!state || !vehicle) {
    return (
      <DashboardLayout title={t("Thanh toán", "Payment")}>
        <div className="empty">
          <h3>{isEn ? "No booking information found" : "Chưa có thông tin đặt xe"}</h3>
          <p>{isEn ? "Please select a car and rental period before checking out." : "Vui lòng chọn xe và thời gian thuê trước khi thanh toán."}</p>
          <div className="mt-16">
            <Link to="/customer/search" className="btn btn-signal">
              {isEn ? "Find Cars Now" : "Tìm xe ngay"}
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  async function handleConfirm() {
    setSubmitting(true);
    try {
      const order = await create({
        customerId: user.id || user._id,
        vehicleId: vehicle.id || vehicle._id,
        startDate: state.startDate,
        endDate: state.endDate,
        rentalType: state.rentalType || "day",
        rentHours: state.rentHours || null,
        rentHourStart: state.rentHourStart || null,
        totalPrice: state.total,
        status: "pending",
        paymentStatus: method === "cash" ? "unpaid" : "paid",
        paymentMethod: method,
        promoCode: state.promoCode,
      });
      setOrderId(order.id || order._id);
    } finally {
      setSubmitting(false);
    }
  }

  if (orderId) {
    return (
      <DashboardLayout title={isEn ? "Booking Successful" : "Đặt xe thành công"}>
        <div className="card" style={{ maxWidth: 480, textAlign: "center", padding: 40, margin: "0 auto" }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>✅</div>
          <h2 style={{ marginBottom: 8 }}>{isEn ? "Booking Confirmed!" : "Đặt xe thành công!"}</h2>
          <p className="text-muted text-sm mb-16">
            {isEn ? `Your rental order for ${vehicle.name} is awaiting provider confirmation.` : `Đơn thuê ${vehicle.name} của bạn đang chờ nhà cung cấp xác nhận.`}
          </p>
          <div className="flex gap-8" style={{ justifyContent: "center" }}>
            <button className="btn btn-signal" onClick={() => navigate(`/customer/orders/${orderId}`)}>
              {isEn ? "View Order" : "Xem đơn hàng"}
            </button>
            <button className="btn btn-outline" onClick={() => navigate("/customer/search")}>
              {isEn ? "Find Other Cars" : "Tìm xe khác"}
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={t("Thanh toán", "Payment")} subtitle={isEn ? "Step 2/2 · Confirm & Pay" : "Bước 2/2 · Xác nhận và thanh toán"}>
      <div className="detail-hero">
        <div className="card">
          <h3 style={{ fontSize: 16, marginBottom: 14 }}>
            {isEn ? "Select Payment Method" : "Chọn phương thức thanh toán"}
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {PAYMENT_METHODS.map((m) => (
              <label
                key={m.value}
                className="card"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: 12,
                  cursor: "pointer",
                  borderColor: method === m.value ? "var(--signal)" : "var(--line)",
                }}
              >
                <input type="radio" name="method" checked={method === m.value} onChange={() => setMethod(m.value)} />
                {t(m.label)}
              </label>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: 16, marginBottom: 14 }}>
            {isEn ? "Rental Summary" : "Tóm tắt đơn thuê"}
          </h3>
          <div className="text-sm mb-8"><strong>{vehicle.name}</strong> ({vehicle.brand} - {vehicle.location})</div>
          <div className="text-sm text-muted mb-16">
            {state.rentalType === "hour" ? (
              <span>⏱️ {isEn ? "Hourly rental: Date " : "Thuê theo giờ: Ngày "}<strong>{formatDate(state.startDate)}</strong> {isEn ? "at " : "lúc "}<strong>{state.rentHourStart}</strong> ({state.rentHours} {isEn ? "hours" : "giờ"})</span>
            ) : (
              <span>📅 {isEn ? "Daily rental: " : "Thuê theo ngày: "}<strong>{formatDate(state.startDate)}</strong> → <strong>{formatDate(state.endDate)}</strong> ({state.days} {isEn ? "days" : "ngày"})</span>
            )}
          </div>

          <div className="lane-divider mb-16" style={{ opacity: 0.4 }} />

          <div className="flex-between text-sm mb-8">
            <span className="text-muted">{isEn ? "Subtotal" : "Tạm tính"}</span>
            <span className="mono">{formatVND(state.subtotal)}</span>
          </div>
          {state.discount > 0 && (
            <div className="flex-between text-sm mb-8" style={{ color: "var(--success)" }}>
              <span>{isEn ? "Discount" : "Giảm giá"} ({state.promoCode})</span>
              <span className="mono">-{formatVND(state.discount)}</span>
            </div>
          )}
          <div className="flex-between mb-16" style={{ fontWeight: 700, fontSize: 16 }}>
            <span>{isEn ? "Total Payment" : "Tổng thanh toán"}</span>
            <span className="mono" style={{ color: "var(--signal-dark)", fontSize: 18 }}>
              {formatVND(state.total)}
            </span>
          </div>

          <button className="btn btn-signal btn-block" disabled={submitting} onClick={handleConfirm}>
            {submitting
              ? (isEn ? "Processing..." : "Đang xử lý...")
              : (isEn ? `Confirm & Pay ${formatVND(state.total)}` : `Xác nhận thanh toán ${formatVND(state.total)}`)}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}

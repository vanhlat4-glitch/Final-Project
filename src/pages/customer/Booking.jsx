import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../components/common/DashboardLayout";
import Loading from "../../components/common/Loading";
import { useApi } from "../../hooks/useApi";
import { useLanguage } from "../../hooks/useLanguage";
import { RESOURCES } from "../../services/api";
import { formatVND } from "../../utils/formatCurrency";
import { daysBetween } from "../../utils/formatDate";

export default function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, isEn } = useLanguage();
  const { items: vehicles, loading } = useApi(RESOURCES.VEHICLES);
  const { items: promotions } = useApi(RESOURCES.PROMOTIONS);

  const vehicle = vehicles.find((v) => String(v.id || v._id) === String(id));

  const today = new Date().toISOString().slice(0, 10);
  const [rentalType, setRentalType] = useState("day"); // "day" | "hour"
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [rentDate, setRentDate] = useState(today);
  const [rentHourStart, setRentHourStart] = useState("08:00");
  const [rentHours, setRentHours] = useState(4);
  const [promoCode, setPromoCode] = useState("");
  const [error, setError] = useState("");

  const pricePerHour = vehicle?.pricePerHour || Math.round((vehicle?.pricePerDay || 700000) / 9);
  const days = daysBetween(startDate, endDate);

  const subtotal = vehicle
    ? rentalType === "hour"
      ? pricePerHour * rentHours
      : vehicle.pricePerDay * days
    : 0;

  const promo = promotions.find((p) => p.code.toLowerCase() === promoCode.trim().toLowerCase());
  const discount = promo ? Math.round((subtotal * promo.discountPercent) / 100) : 0;
  const total = subtotal - discount;

  function handleContinue(e) {
    e.preventDefault();
    setError("");
    if (rentalType === "day" && new Date(endDate) < new Date(startDate)) {
      setError(isEn ? "Return date must be equal or after pickup date" : "Ngày trả xe phải sau hoặc bằng ngày nhận xe");
      return;
    }
    navigate("/customer/payment", {
      state: {
        vehicleId: vehicle.id || vehicle._id,
        rentalType,
        startDate: rentalType === "hour" ? rentDate : startDate,
        endDate: rentalType === "hour" ? rentDate : endDate,
        rentHourStart: rentalType === "hour" ? rentHourStart : null,
        rentHours: rentalType === "hour" ? rentHours : null,
        days: rentalType === "day" ? days : null,
        subtotal,
        discount,
        total,
        promoCode: promo ? promo.code : null,
      },
    });
  }

  if (loading) {
    return (
      <DashboardLayout title={t("Đặt xe", "Book Vehicle")}>
        <Loading />
      </DashboardLayout>
    );
  }

  if (!vehicle) {
    return (
      <DashboardLayout title={isEn ? "Vehicle Not Found" : "Không tìm thấy xe"}>
        <div className="card">
          <p className="mb-16">{isEn ? "Requested vehicle details not found." : "Không tìm thấy thông tin xe yêu cầu."}</p>
          <Link to="/customer/search" className="btn btn-signal">
            ← {isEn ? "Back to Find Cars" : "Quay lại tìm xe"}
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={t("Đặt xe", "Book Vehicle")} subtitle={isEn ? `Step 1/2 · ${vehicle.name}` : `Bước 1/2 · ${vehicle.name}`}>
      <Link to={`/customer/vehicles/${vehicle.id || vehicle._id}`} className="link text-sm">
        ← {isEn ? "Back to vehicle details" : "Quay lại chi tiết xe"}
      </Link>

      <div className="detail-hero mt-16">
        <div className="card" style={{ height: "fit-content" }}>
          <img
            src={vehicle.image}
            alt={vehicle.name}
            style={{ width: "100%", height: 180, objectFit: "cover", borderRadius: 8, marginBottom: 14 }}
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=800&q=80";
            }}
          />
          <div style={{ fontWeight: 700, fontSize: 17, fontFamily: "var(--font-display)" }}>{vehicle.name}</div>
          <div className="text-muted text-sm mt-8">
            {vehicle.brand} · {t(vehicle.type)} · {vehicle.seats} {isEn ? "seats" : "chỗ"} · {vehicle.location}
          </div>

          <div className="lane-divider mt-16 mb-16" style={{ opacity: 0.4 }} />

          <div style={{ fontSize: 13 }}>
            <div className="flex-between mb-8">
              <span className="text-muted">{isEn ? "Hourly Rate:" : "Giá theo giờ:"}</span>
              <strong className="mono">{formatVND(pricePerHour)}/h</strong>
            </div>
            <div className="flex-between">
              <span className="text-muted">{isEn ? "Daily Rate:" : "Giá theo ngày:"}</span>
              <strong className="mono">{formatVND(vehicle.pricePerDay)}/{isEn ? "day" : "ngày"}</strong>
            </div>
          </div>
        </div>

        <form className="card" onSubmit={handleContinue}>
          <h3 style={{ fontSize: 16, marginBottom: 14 }}>
            {isEn ? "Rental Type" : "Hình thức thuê xe"}
          </h3>

          {/* Type Toggle */}
          <div className="role-toggle mb-16">
            <button
              type="button"
              className={rentalType === "day" ? "active" : ""}
              onClick={() => setRentalType("day")}
            >
              📅 {isEn ? "Daily Rental (Package)" : "Thuê theo ngày (Trọn gói)"}
            </button>
            <button
              type="button"
              className={rentalType === "hour" ? "active" : ""}
              onClick={() => setRentalType("hour")}
            >
              ⏱️ {isEn ? "Hourly Rental (Flexible)" : "Thuê theo giờ (Linh hoạt)"}
            </button>
          </div>

          {error && <div className="form-error">{error}</div>}

          {rentalType === "day" ? (
            <div className="form-row">
              <div className="field">
                <label>{isEn ? "Pickup Date" : "Ngày nhận xe"}</label>
                <input
                  className="input"
                  type="date"
                  required
                  min={today}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="field">
                <label>{isEn ? "Return Date" : "Ngày trả xe"}</label>
                <input
                  className="input"
                  type="date"
                  required
                  min={startDate}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="form-row">
                <div className="field">
                  <label>{isEn ? "Rental Date" : "Ngày thuê xe"}</label>
                  <input
                    className="input"
                    type="date"
                    required
                    min={today}
                    value={rentDate}
                    onChange={(e) => setRentDate(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>{isEn ? "Start Time" : "Giờ bắt đầu"}</label>
                  <input
                    className="input"
                    type="time"
                    required
                    value={rentHourStart}
                    onChange={(e) => setRentHourStart(e.target.value)}
                  />
                </div>
              </div>
              <div className="field">
                <label>{isEn ? "Estimated Hours" : "Số giờ thuê dự kiến"}</label>
                <select
                  className="input"
                  value={rentHours}
                  onChange={(e) => setRentHours(Number(e.target.value))}
                >
                  <option value={2}>2 {isEn ? "hours (Short city trip)" : "giờ (Ngắn hạn trong phố)"}</option>
                  <option value={4}>4 {isEn ? "hours (Half day)" : "giờ (Nửa buổi)"}</option>
                  <option value={6}>6 {isEn ? "hours (Client meeting / travel)" : "giờ (Gặp đối tác / di chuyển)"}</option>
                  <option value={8}>8 {isEn ? "hours (Full workday)" : "giờ (Một ngày làm việc)"}</option>
                  <option value={12}>12 {isEn ? "hours (All day)" : "giờ (Cả ngày)"}</option>
                </select>
              </div>
            </>
          )}

          <div className="field mt-8">
            <label>{isEn ? "Discount Code (Optional)" : "Mã khuyến mãi (nếu có)"}</label>
            <input
              className="input"
              placeholder={isEn ? "e.g., MORENT10 or SUMMER15" : "VD: MORENT10 hoặc SUMMER15"}
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
            />
          </div>

          <div className="lane-divider mt-16 mb-16" style={{ opacity: 0.4 }} />

          <div className="flex-between text-sm mb-8">
            <span className="text-muted">
              {rentalType === "hour"
                ? `${formatVND(pricePerHour)} × ${rentHours} ${isEn ? "hours" : "giờ"}`
                : `${formatVND(vehicle.pricePerDay)} × ${days} ${isEn ? "days" : "ngày"}`}
            </span>
            <span className="mono">{formatVND(subtotal)}</span>
          </div>

          {promo && (
            <div className="flex-between text-sm mb-8" style={{ color: "var(--success)" }}>
              <span>{isEn ? `Code ${promo.code} (-${promo.discountPercent}%)` : `Mã ${promo.code} (-${promo.discountPercent}%)`}</span>
              <span className="mono">-{formatVND(discount)}</span>
            </div>
          )}

          <div className="flex-between mb-16" style={{ fontWeight: 700, fontSize: 16 }}>
            <span>{isEn ? "Total Amount" : "Tổng cộng"}</span>
            <span className="mono" style={{ color: "var(--signal-dark)", fontSize: 18 }}>
              {formatVND(total)}
            </span>
          </div>

          <button className="btn btn-signal btn-block" style={{ padding: 12, fontSize: 15 }}>
            {isEn ? "Proceed to Payment →" : "Tiếp tục đến thanh toán →"}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}

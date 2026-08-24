import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../components/common/DashboardLayout";
import Loading from "../../components/common/Loading";
import { useApi } from "../../hooks/useApi";
import { RESOURCES } from "../../services/api";
import { formatVND } from "../../utils/formatCurrency";
import { daysBetween } from "../../utils/formatDate";

export default function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { items: vehicles, loading } = useApi(RESOURCES.VEHICLES);
  const { items: promotions } = useApi(RESOURCES.PROMOTIONS);

  const vehicle = vehicles.find((v) => String(v.id) === String(id));

  const today = new Date().toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [promoCode, setPromoCode] = useState("");
  const [error, setError] = useState("");

  const days = daysBetween(startDate, endDate);
  const subtotal = vehicle ? vehicle.pricePerDay * days : 0;
  const promo = promotions.find((p) => p.code.toLowerCase() === promoCode.trim().toLowerCase());
  const discount = promo ? Math.round((subtotal * promo.discountPercent) / 100) : 0;
  const total = subtotal - discount;

  function handleContinue(e) {
    e.preventDefault();
    setError("");
    if (new Date(endDate) < new Date(startDate)) {
      setError("Ngày trả xe phải sau ngày nhận xe");
      return;
    }
    navigate("/customer/payment", {
      state: {
        vehicleId: vehicle.id,
        startDate,
        endDate,
        days,
        subtotal,
        discount,
        total,
        promoCode: promo ? promo.code : null,
      },
    });
  }

  if (loading) {
    return (
      <DashboardLayout title="Đặt xe">
        <Loading />
      </DashboardLayout>
    );
  }

  if (!vehicle) {
    return (
      <DashboardLayout title="Không tìm thấy xe">
        <Link to="/customer/search" className="link">← Quay lại tìm xe</Link>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Đặt xe" subtitle={`Bước 1/2 · ${vehicle.name}`}>
      <Link to={`/customer/vehicles/${vehicle.id}`} className="link text-sm">← Quay lại chi tiết xe</Link>

      <div className="detail-hero mt-16">
        <div className="card" style={{ height: "fit-content" }}>
          <img src={vehicle.image} alt={vehicle.name} style={{ width: "100%", height: 180, objectFit: "cover", borderRadius: 8, marginBottom: 14 }} />
          <div style={{ fontWeight: 700, fontFamily: "var(--font-display)" }}>{vehicle.name}</div>
          <div className="text-muted text-sm mt-8">{vehicle.type} · {vehicle.seats} chỗ · {vehicle.location}</div>
        </div>

        <form className="card" onSubmit={handleContinue}>
          <h3 style={{ fontSize: 16, marginBottom: 14 }}>Chọn thời gian thuê</h3>
          {error && <div className="form-error">{error}</div>}
          <div className="form-row">
            <div className="field">
              <label>Ngày nhận xe</label>
              <input className="input" type="date" required min={today} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="field">
              <label>Ngày trả xe</label>
              <input className="input" type="date" required min={startDate} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <div className="field">
            <label>Mã khuyến mãi (nếu có)</label>
            <input className="input" placeholder="VD: MORENT10" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} />
          </div>

          <div className="lane-divider mt-16 mb-16" style={{ opacity: 0.4 }} />

          <div className="flex-between text-sm mb-8">
            <span className="text-muted">{formatVND(vehicle.pricePerDay)} × {days} ngày</span>
            <span className="mono">{formatVND(subtotal)}</span>
          </div>
          {promo && (
            <div className="flex-between text-sm mb-8" style={{ color: "var(--success)" }}>
              <span>Mã {promo.code} (-{promo.discountPercent}%)</span>
              <span className="mono">-{formatVND(discount)}</span>
            </div>
          )}
          <div className="flex-between mb-16" style={{ fontWeight: 700 }}>
            <span>Tổng cộng</span>
            <span className="mono">{formatVND(total)}</span>
          </div>

          <button className="btn btn-signal btn-block">Tiếp tục đến thanh toán →</button>
        </form>
      </div>
    </DashboardLayout>
  );
}

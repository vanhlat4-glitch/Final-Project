import { Link, useParams } from "react-router-dom";
import DashboardLayout from "../../components/common/DashboardLayout";
import Loading from "../../components/common/Loading";
import { useApi } from "../../hooks/useApi";
import { useLanguage } from "../../hooks/useLanguage";
import { RESOURCES } from "../../services/api";
import { formatVND } from "../../utils/formatCurrency";

export default function VehicleDetail() {
  const { id } = useParams();
  const { t, isEn } = useLanguage();
  const { items: vehicles, loading } = useApi(RESOURCES.VEHICLES);
  const { items: reviews } = useApi(RESOURCES.REVIEWS);

  const vehicle = vehicles.find((v) => String(v.id || v._id) === String(id));
  const vehicleReviews = reviews.filter((r) => String(r.vehicleId) === String(id) || String(r.vehicleId) === String(vehicle?.id) || String(r.vehicleId) === String(vehicle?._id));

  if (loading) {
    return (
      <DashboardLayout title={t("Chi tiết phương tiện", "Vehicle Details")}>
        <Loading />
      </DashboardLayout>
    );
  }

  if (!vehicle) {
    return (
      <DashboardLayout title={isEn ? "Vehicle Not Found" : "Không tìm thấy xe"}>
        <div className="card">
          <p className="mb-16">
            {isEn ? "The requested vehicle could not be found or has been removed from the platform." : "Không tìm thấy thông tin xe yêu cầu hoặc xe đã được gỡ khỏi hệ thống."}
          </p>
          <Link to="/customer/search" className="btn btn-signal">
            ← {isEn ? "Back to Find Cars" : "Quay lại tìm xe"}
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const pricePerHour = vehicle.pricePerHour || Math.round((vehicle.pricePerDay || 700000) / 9);

  return (
    <DashboardLayout title={vehicle.name} subtitle={`${vehicle.brand} · ${t(vehicle.type)} · ${vehicle.location}`}>
      <Link to="/customer/search" className="link text-sm">
        ← {isEn ? "Back to Find Cars" : "Quay lại tìm xe"}
      </Link>

      <div className="detail-hero mt-16">
        <div>
          <div style={{ position: "relative" }}>
            <img
              src={vehicle.image}
              alt={vehicle.name}
              style={{ width: "100%", height: 360, objectFit: "cover", borderRadius: "var(--radius)" }}
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=800&q=80";
              }}
            />
            {(vehicle.fuel === "Điện" || vehicle.fuel === "Electric") && (
              <span style={{ position: "absolute", top: 14, left: 14, background: "#059669", color: "#fff", padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 700 }}>
                ⚡ {isEn ? "100% PURE ELECTRIC" : "XE THUẦN ĐIỆN"}
              </span>
            )}
          </div>

          <div className="card mt-16">
            <h3 style={{ fontSize: 16, marginBottom: 12, fontWeight: 700 }}>
              {isEn ? "Technical Specifications" : "Thông số kỹ thuật"}
            </h3>
            <div className="kpi-row" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12 }}>
              <div className="card" style={{ background: "var(--paper)", padding: "12px 14px", border: "1px solid var(--line)" }}>
                <span className="text-muted text-sm">{isEn ? "Brand" : "Hãng xe"}</span>
                <strong style={{ fontSize: 15, color: "var(--ink)", marginTop: 4 }}>{vehicle.brand}</strong>
              </div>
              <div className="card" style={{ background: "var(--paper)", padding: "12px 14px", border: "1px solid var(--line)" }}>
                <span className="text-muted text-sm">{isEn ? "Body Type" : "Kiểu dáng"}</span>
                <strong style={{ fontSize: 15, color: "var(--ink)", marginTop: 4 }}>{t(vehicle.type)}</strong>
              </div>
              <div className="card" style={{ background: "var(--paper)", padding: "12px 14px", border: "1px solid var(--line)" }}>
                <span className="text-muted text-sm">{isEn ? "Seats" : "Số chỗ"}</span>
                <strong style={{ fontSize: 15, color: "var(--ink)", marginTop: 4 }}>{vehicle.seats} {isEn ? "seats" : "chỗ"}</strong>
              </div>
              <div className="card" style={{ background: "var(--paper)", padding: "12px 14px", border: "1px solid var(--line)" }}>
                <span className="text-muted text-sm">{isEn ? "Transmission" : "Hộp số"}</span>
                <strong style={{ fontSize: 15, color: "var(--ink)", marginTop: 4 }}>{t(vehicle.transmission)}</strong>
              </div>
              <div className="card" style={{ background: "var(--paper)", padding: "12px 14px", border: "1px solid var(--line)" }}>
                <span className="text-muted text-sm">{isEn ? "Fuel Type" : "Nhiên liệu"}</span>
                <strong style={{ fontSize: 15, color: "var(--ink)", marginTop: 4 }}>{t(vehicle.fuel)}</strong>
              </div>
              <div className="card" style={{ background: "var(--paper)", padding: "12px 14px", border: "1px solid var(--line)" }}>
                <span className="text-muted text-sm">{isEn ? "Location" : "Khu vực"}</span>
                <strong style={{ fontSize: 15, color: "var(--ink)", marginTop: 4 }}>{vehicle.location}</strong>
              </div>
            </div>
          </div>

          <div className="card mt-16">
            <h3 style={{ fontSize: 16, marginBottom: 10, fontWeight: 700 }}>
              {isEn ? "Vehicle Description" : "Mô tả phương tiện"}
            </h3>
            <p className="text-sm" style={{ lineHeight: 1.6, color: "var(--ink)" }}>{vehicle.description}</p>

            {vehicle.features && vehicle.features.length > 0 && (
              <div style={{ marginTop: 14 }}>
                <strong style={{ fontSize: 13, display: "block", marginBottom: 8 }}>
                  {isEn ? "Features & Amenities:" : "Trang bị & Tiện nghi nổi bật:"}
                </strong>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {vehicle.features.map((feat, idx) => (
                    <span key={idx} className="plate">
                      ✓ {t(feat)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {vehicleReviews.length > 0 && (
            <div className="mt-24">
              <h3 style={{ fontSize: 16, marginBottom: 12, fontWeight: 700 }}>
                {isEn ? `Customer Reviews (${vehicleReviews.length})` : `Đánh giá từ khách hàng (${vehicleReviews.length})`}
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {vehicleReviews.map((r) => (
                  <div className="card" key={r.id || r._id}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span className="stars text-sm">{"★".repeat(r.rating || 5)}{"☆".repeat(5 - (r.rating || 5))}</span>
                      <span className="text-sm text-muted">{r.createdAt || (isEn ? "Recently" : "Gần đây")}</span>
                    </div>
                    <p className="text-sm" style={{ lineHeight: 1.5 }}>{r.comment}</p>
                    {r.providerReply && (
                      <div style={{ marginTop: 8, padding: "8px 12px", background: "var(--paper)", borderRadius: 6, fontSize: 12 }}>
                        <strong>{isEn ? "Provider reply:" : "Chủ xe phản hồi:"}</strong> {r.providerReply}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="card" style={{ position: "sticky", top: 20 }}>
            <h3 style={{ fontSize: 18, marginBottom: 14, fontWeight: 700 }}>
              {isEn ? "Rental Pricing" : "Bảng giá thuê"}
            </h3>

            <div style={{ background: "var(--paper)", padding: 14, borderRadius: "var(--radius-sm)", border: "1px solid var(--line)", marginBottom: 16 }}>
              <div className="flex-between mb-8">
                <span className="text-sm text-muted">{isEn ? "Hourly rental:" : "Thuê theo giờ:"}</span>
                <span className="price" style={{ color: "var(--signal-dark)", fontSize: 18 }}>
                  {formatVND(pricePerHour)}<small>/{isEn ? "hour" : "giờ"}</small>
                </span>
              </div>
              <div className="flex-between">
                <span className="text-sm text-muted">{isEn ? "Daily rental:" : "Thuê trọn ngày:"}</span>
                <span className="price" style={{ fontSize: 18 }}>
                  {formatVND(vehicle.pricePerDay)}<small>/{isEn ? "day" : "ngày"}</small>
                </span>
              </div>
            </div>

            <div style={{ borderTop: "1px solid var(--line)", paddingTop: 14, marginBottom: 16 }}>
              <h4 style={{ fontSize: 13.5, marginBottom: 8, fontWeight: 600 }}>
                {isEn ? "Morent Service Commitment:" : "Cam kết dịch vụ Morent:"}
              </h4>
              <ul style={{ paddingLeft: 18, fontSize: 12.5, color: "var(--muted)", lineHeight: 1.6 }}>
                <li>{isEn ? "Comprehensive 2-way standard insurance" : "Bảo hiểm vật chất 2 chiều tiêu chuẩn"}</li>
                <li>{isEn ? "Door-to-door or airport delivery available" : "Hỗ trợ giao nhận xe tận nơi hoặc sân bay"}</li>
                <li>{isEn ? "Deeply sanitized & cleaned before hand-over" : "Vệ sinh, khử khuẩn xe sạch sẽ trước khi bàn giao"}</li>
                <li>{isEn ? "24/7 technical roadside emergency assistance" : "Hỗ trợ sự cố kỹ thuật cứu hộ 24/7"}</li>
              </ul>
            </div>

            {vehicle.status === "maintenance" && (
              <div className="card mb-16" style={{ background: "rgba(245, 158, 11, 0.1)", border: "1px solid var(--warning)", color: "#b45309", padding: "12px 14px", borderRadius: 8 }}>
                <strong>⚠️ {isEn ? "Vehicle Under Maintenance" : "Xe đang sửa chữa / bảo trì"}</strong>
                <p className="text-sm mt-4" style={{ color: "var(--ink)" }}>
                  {isEn
                    ? "This vehicle is currently undergoing maintenance or repairs and is temporarily unavailable for rent."
                    : "Xe này hiện đang trong quá trình bảo dưỡng / sửa chữa kỹ thuật và tạm thời chưa nhận đặt lịch thuê mới."}
                </p>
              </div>
            )}

            {vehicle.status === "paused" && (
              <div className="card mb-16" style={{ background: "rgba(107, 114, 128, 0.1)", border: "1px solid var(--muted)", color: "var(--ink)", padding: "12px 14px", borderRadius: 8 }}>
                <strong>⏸️ {isEn ? "Rental Paused by Owner" : "Tạm ngưng cho thuê"}</strong>
                <p className="text-sm mt-4 text-muted">
                  {isEn
                    ? "The vehicle owner has temporarily paused rental bookings for this vehicle."
                    : "Chủ xe hiện đang tạm ngưng nhận đặt lịch thuê cho xe này."}
                </p>
              </div>
            )}

            {vehicle.status !== "approved" && vehicle.status !== "maintenance" && vehicle.status !== "paused" && (
              <div className="card mb-16" style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid var(--danger)", color: "var(--danger)", padding: "12px 14px", borderRadius: 8 }}>
                <strong>⛔ {isEn ? "Vehicle Unavailable" : "Xe chưa sẵn sàng"}</strong>
                <p className="text-sm mt-4 text-muted">
                  {isEn ? "This vehicle is pending approval or currently not active." : "Xe đang chờ duyệt hoặc chưa sẵn sàng cho thuê."}
                </p>
              </div>
            )}

            {vehicle.status === "approved" ? (
              <Link to={`/customer/booking/${vehicle.id || vehicle._id}`} className="btn btn-signal btn-block" style={{ padding: "12px 16px", fontSize: 15, textAlign: "center" }}>
                {isEn ? "Book This Car Now →" : "Đặt thuê xe này ngay →"}
              </Link>
            ) : (
              <button disabled className="btn btn-block" style={{ padding: "12px 16px", fontSize: 15, opacity: 0.6, cursor: "not-allowed", background: "var(--paper)", border: "1px solid var(--line)" }}>
                {vehicle.status === "maintenance"
                  ? (isEn ? "Under Maintenance" : "Đang sửa chữa / Bảo trì")
                  : vehicle.status === "paused"
                  ? (isEn ? "Temporarily Paused" : "Tạm ngưng cho thuê")
                  : (isEn ? "Unavailable for Booking" : "Tạm thời không thể đặt")}
              </button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

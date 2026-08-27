import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/common/DashboardLayout";
import Loading from "../../components/common/Loading";
import { useApi } from "../../hooks/useApi";
import { RESOURCES } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import { useLanguage } from "../../hooks/useLanguage";
import { formatVND } from "../../utils/formatCurrency";

export default function Home() {
  const { user } = useAuth();
  const { t, isEn } = useLanguage();
  const { items: vehicles, loading } = useApi(RESOURCES.VEHICLES);
  const { items: promotions } = useApi(RESOURCES.PROMOTIONS);
  const [selectedBrand, setSelectedBrand] = useState("all");

  const approved = useMemo(
    () => vehicles.filter((v) => v.status === "approved"),
    [vehicles]
  );

  const brands = useMemo(
    () => ["all", ...new Set(approved.map((v) => v.brand).filter(Boolean))],
    [approved]
  );

  const filteredVehicles = useMemo(() => {
    let list = approved;
    if (selectedBrand !== "all") {
      list = list.filter((v) => v.brand === selectedBrand);
    }
    return list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }, [approved, selectedBrand]);

  const userName = user?.name?.split(" ").slice(-1)[0] || (isEn ? "there" : "bạn");

  return (
    <DashboardLayout
      title={`${isEn ? "Hello" : "Chào"} ${userName} 👋`}
      subtitle={t("ready_to_drive", "Bạn muốn thuê xe nào hôm nay?")}
    >
      <div
        className="card mb-16"
        style={{
          background: "linear-gradient(135deg, #14171c 0%, #212631 100%)",
          color: "#fff",
          border: "none",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: "-20px",
            bottom: "-30px",
            opacity: 0.08,
            fontSize: "130px",
            fontWeight: 900,
            fontFamily: "var(--font-display)",
            pointerEvents: "none",
          }}
        >
          MORENT
        </div>
        <div className="flex-between" style={{ flexWrap: "wrap", gap: 16, position: "relative", zIndex: 1 }}>
          <div>
            <div style={{ display: "inline-block", background: "var(--signal)", color: "#11141a", fontWeight: 700, fontSize: 11, padding: "2px 8px", borderRadius: 4, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {t("Đa dạng chủng loại", "Diverse Selection")}
            </div>
            <h2 style={{ fontSize: 22, marginBottom: 6, fontWeight: 700, color: "#fff" }}>
              {t("Tìm xe phù hợp cho chuyến đi tiếp theo", "Find the perfect car for your next journey")}
            </h2>
            <p style={{ color: "#d1d5db", fontSize: 13.5 }}>
              {t("Hơn 20+ dòng xe Sedan, SUV, Xe điện, Xe sang đã kiểm duyệt sẵn sàng giao nhận tận nơi.", "20+ verified Sedan, SUV, Electric, and Luxury models ready for delivery.")}
            </p>
          </div>
          <Link to="/customer/search" className="btn btn-signal" style={{ padding: "12px 24px", fontSize: 14 }}>
            {t("Khám phá tất cả xe →", "Explore all cars →")}
          </Link>
        </div>
      </div>

      {promotions.length > 0 && (
        <div className="card mb-16">
          <div className="flex-between mb-8">
            <strong style={{ fontSize: 14 }}>{t("Ưu đãi đang chạy", "Active Promotions")}</strong>
            <Link to="/customer/promotions" className="link text-sm">
              {t("Xem tất cả", "View all")}
            </Link>
          </div>
          <div className="plate-strip">
            {promotions.map((p) => (
              <span
                key={p.id || p._id}
                className="plate promo-plate"
              >
                🏷️ <strong style={{ color: "var(--signal-dark)", marginRight: 2 }}>{p.code}</strong> · {t("Giảm", "Discount")} {p.discountPercent}% ({p.description})
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="section-head">
        <div>
          <h2>{t("Danh sách xe nổi bật", "Featured Vehicles")}</h2>
          <p>{t("Thuê theo giờ hoặc theo ngày linh hoạt · Đầy đủ bảo hiểm & kiểm định", "Flexible hourly or daily rental · Fully insured & verified")}</p>
        </div>
        <Link to="/customer/search" className="link text-sm">
          {isEn ? `View all (${approved.length} cars)` : `Xem toàn bộ (${approved.length} xe)`}
        </Link>
      </div>

      {/* Brand Filter Tabs */}
      <div className="brand-strip mb-16" style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
        {brands.map((b) => (
          <button
            key={b}
            onClick={() => setSelectedBrand(b)}
            className={`btn btn-sm ${selectedBrand === b ? "btn-signal" : "btn-outline"}`}
            style={{ borderRadius: 20, whiteSpace: "nowrap" }}
          >
            {b === "all" ? (isEn ? "🔥 All Brands" : "🔥 Tất cả hãng") : b}
          </button>
        ))}
      </div>

      {loading ? (
        <Loading />
      ) : (
        <div className="grid grid-3">
          {filteredVehicles.slice(0, 9).map((v) => (
            <Link
              to={`/customer/vehicles/${v.id || v._id}`}
              key={v.id || v._id}
              className="vehicle-card"
            >
              <div style={{ position: "relative" }}>
                <img
                  className="vehicle-card__img"
                  src={v.image}
                  alt={v.name}
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=800&q=80";
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    background: "rgba(20, 23, 28, 0.8)",
                    color: "#fff",
                    padding: "3px 8px",
                    borderRadius: 6,
                    fontSize: 11.5,
                    fontWeight: 600,
                  }}
                >
                  📍 {v.location}
                </span>
                {(v.fuel === "Điện" || v.fuel === "Electric") && (
                  <span
                    style={{
                      position: "absolute",
                      top: 10,
                      left: 10,
                      background: "#059669",
                      color: "#fff",
                      padding: "3px 8px",
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    ⚡ {isEn ? "ELECTRIC CAR" : "XE ĐIỆN"}
                  </span>
                )}
              </div>

              <div className="vehicle-card__body">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--signal-dark)", textTransform: "uppercase" }}>
                    {v.brand}
                  </span>
                  {v.rating > 0 && <span className="stars text-sm">★ {v.rating}</span>}
                </div>

                <div className="vehicle-card__title">{v.name}</div>

                <div className="vehicle-card__meta">
                  <span>🚗 {t(v.type)}</span>
                  <span>💺 {v.seats} {isEn ? "seats" : "chỗ"}</span>
                  <span>⚙️ {t(v.transmission)}</span>
                  <span>⛽ {t(v.fuel)}</span>
                </div>

                <div className="vehicle-card__foot" style={{ borderTop: "1px solid var(--line)", paddingTop: 10 }}>
                  <div>
                    <div style={{ fontSize: 11.5, color: "var(--muted)", marginBottom: 2 }}>
                      {t("Giá thuê:", "Rental Price:")}
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                      <span className="price" style={{ color: "var(--signal-dark)" }}>
                        {formatVND(v.pricePerHour || Math.round((v.pricePerDay || 700000) / 9))}
                        <small style={{ color: "var(--ink)", fontWeight: 600 }}>/h</small>
                      </span>
                      <span style={{ color: "var(--line)" }}>·</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)" }}>
                        {formatVND(v.pricePerDay)}<small>/{isEn ? "day" : "ngày"}</small>
                      </span>
                    </div>
                  </div>
                  <span className="btn btn-outline btn-sm" style={{ pointerEvents: "none" }}>
                    {t("Xem chi tiết", "Details")} →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

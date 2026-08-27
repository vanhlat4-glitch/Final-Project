import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/common/DashboardLayout";
import Loading from "../../components/common/Loading";
import EmptyState from "../../components/ui/EmptyState";
import { useApi } from "../../hooks/useApi";
import { useLanguage } from "../../hooks/useLanguage";
import { RESOURCES } from "../../services/api";
import { formatVND } from "../../utils/formatCurrency";

export default function SearchVehicle() {
  const { items: vehicles, loading } = useApi(RESOURCES.VEHICLES);
  const { t, isEn } = useLanguage();
  const [q, setQ] = useState("");
  const [brand, setBrand] = useState("all");
  const [type, setType] = useState("all");
  const [fuel, setFuel] = useState("all");
  const [seats, setSeats] = useState("all");
  const [sort, setSort] = useState("default");

  const approved = useMemo(() => vehicles.filter((v) => v.status === "approved"), [vehicles]);
  const brands = useMemo(() => ["all", ...new Set(approved.map((v) => v.brand).filter(Boolean))], [approved]);
  const types = useMemo(() => ["all", ...new Set(approved.map((v) => v.type).filter(Boolean))], [approved]);
  const fuels = useMemo(() => ["all", ...new Set(approved.map((v) => v.fuel).filter(Boolean))], [approved]);

  const results = useMemo(() => {
    let list = approved.filter((v) => {
      const matchesQ = `${v.name} ${v.brand} ${v.location} ${v.type}`.toLowerCase().includes(q.toLowerCase());
      const matchesBrand = brand === "all" || v.brand === brand;
      const matchesType = type === "all" || v.type === type;
      const matchesFuel = fuel === "all" || v.fuel === fuel;
      const matchesSeats = seats === "all" || String(v.seats) === String(seats);
      return matchesQ && matchesBrand && matchesType && matchesFuel && matchesSeats;
    });

    if (sort === "price-hour-asc") list = [...list].sort((a, b) => (a.pricePerHour || a.pricePerDay / 9) - (b.pricePerHour || b.pricePerDay / 9));
    if (sort === "price-asc") list = [...list].sort((a, b) => a.pricePerDay - b.pricePerDay);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.pricePerDay - a.pricePerDay);
    if (sort === "rating") list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return list;
  }, [approved, q, brand, type, fuel, seats, sort]);

  function resetFilters() {
    setQ("");
    setBrand("all");
    setType("all");
    setFuel("all");
    setSeats("all");
    setSort("default");
  }

  return (
    <DashboardLayout
      title={t("Tìm xe cho thuê", "Search Rental Cars")}
      subtitle={
        isEn
          ? `Explore ${approved.length} verified high-quality self-drive cars, flexible hourly or daily rentals`
          : `Khám phá ${approved.length} xe tự lái chất lượng cao, đa dạng lựa chọn thuê theo giờ hoặc ngày`
      }
    >
      <div className="card mb-16">
        <div className="filters-bar" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
          <input
            className="input"
            placeholder={isEn ? "🔍 Search car, brand, location..." : "🔍 Tìm xe, hãng, khu vực..."}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select className="input" value={brand} onChange={(e) => setBrand(e.target.value)}>
            <option value="all">🚗 {isEn ? "All Brands" : "Tất cả hãng xe"}</option>
            {brands.filter((b) => b !== "all").map((b) => (
              <option key={b} value={b}>{isEn ? `${b} Brand` : `Hãng ${b}`}</option>
            ))}
          </select>
          <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="all">🚘 {isEn ? "All Body Types" : "Tất cả kiểu xe"}</option>
            {types.filter((tItem) => tItem !== "all").map((tItem) => (
              <option key={tItem} value={tItem}>{t(tItem)}</option>
            ))}
          </select>
          <select className="input" value={seats} onChange={(e) => setSeats(e.target.value)}>
            <option value="all">💺 {isEn ? "Seat Capacity (All)" : "Số chỗ ngồi (Tất cả)"}</option>
            <option value="4">4 {isEn ? "seats" : "chỗ"}</option>
            <option value="5">5 {isEn ? "seats" : "chỗ"}</option>
            <option value="7">7 {isEn ? "seats" : "chỗ"}</option>
          </select>
          <select className="input" value={fuel} onChange={(e) => setFuel(e.target.value)}>
            <option value="all">⛽ {isEn ? "Fuel Type (All)" : "Nhiên liệu (Tất cả)"}</option>
            {fuels.filter((f) => f !== "all").map((f) => (
              <option key={f} value={f}>{t(f)}</option>
            ))}
          </select>
          <select className="input" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="default">↕️ {isEn ? "Sort: Default" : "Sắp xếp: Mặc định"}</option>
            <option value="price-hour-asc">{isEn ? "Price/hour: Low → High" : "Giá/giờ: Thấp → Cao"}</option>
            <option value="price-asc">{isEn ? "Price/day: Low → High" : "Giá/ngày: Thấp → Cao"}</option>
            <option value="price-desc">{isEn ? "Price/day: High → Low" : "Giá/ngày: Cao → Thấp"}</option>
            <option value="rating">{isEn ? "Highest Rated" : "Đánh giá cao nhất"}</option>
          </select>
        </div>

        {(q || brand !== "all" || type !== "all" || fuel !== "all" || seats !== "all" || sort !== "default") && (
          <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, color: "var(--muted)" }}>
              {isEn ? (
                <>Found <strong>{results.length}</strong> matching vehicles</>
              ) : (
                <>Tìm thấy <strong>{results.length}</strong> xe phù hợp</>
              )}
            </span>
            <button className="btn btn-outline btn-sm" onClick={resetFilters}>
              {isEn ? "Reset Filters" : "Xóa bộ lọc"}
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <Loading />
      ) : results.length === 0 ? (
        <EmptyState
          title={isEn ? "No matching cars found" : "Không tìm thấy xe phù hợp"}
          hint={isEn ? "Try changing keywords or clearing filters to see more vehicles." : "Thử đổi từ khoá hoặc xoá bớt bộ lọc để xem nhiều xe hơn."}
        />
      ) : (
        <div className="grid grid-3">
          {results.map((v) => (
            <Link to={`/customer/vehicles/${v.id || v._id}`} key={v.id || v._id} className="vehicle-card">
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
                    <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 2 }}>
                      {isEn ? "Flexible price:" : "Giá thuê linh hoạt:"}
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
                  <span className="btn btn-signal btn-sm" style={{ pointerEvents: "none" }}>
                    {isEn ? "Book Now →" : "Đặt xe →"}
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

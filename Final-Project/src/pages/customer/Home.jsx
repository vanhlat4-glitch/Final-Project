import { Link } from "react-router-dom";
import DashboardLayout from "../../components/common/DashboardLayout";
import Loading from "../../components/common/Loading";
import { useApi } from "../../hooks/useApi";
import { RESOURCES } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import { formatVND } from "../../utils/formatCurrency";

export default function Home() {
  const { user } = useAuth();
  const { items: vehicles, loading } = useApi(RESOURCES.VEHICLES);
  const { items: promotions } = useApi(RESOURCES.PROMOTIONS);

  const featured = vehicles.filter((v) => v.status === "approved").sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 3);

  return (
    <DashboardLayout title={`Chào ${user.name.split(" ").slice(-1)[0]} 👋`} subtitle="Bạn muốn thuê xe nào hôm nay?">
      <div className="card mb-16" style={{ background: "var(--ink)", color: "#fff", border: "none" }}>
        <div className="flex-between" style={{ flexWrap: "wrap", gap: 16 }}>
          <div>
            <h2 style={{ fontSize: 20, marginBottom: 6 }}>Tìm xe phù hợp cho chuyến đi tiếp theo</h2>
            <p style={{ color: "var(--muted-2)", fontSize: 13.5 }}>Hàng trăm xe đã kiểm duyệt, đặt xe chỉ trong vài phút.</p>
          </div>
          <Link to="/customer/search" className="btn btn-signal">Tìm xe ngay</Link>
        </div>
      </div>

      {promotions.length > 0 && (
        <div className="card mb-16">
          <div className="flex-between mb-8">
            <strong style={{ fontSize: 14 }}>Ưu đãi đang chạy</strong>
            <Link to="/customer/promotions" className="link text-sm">Xem tất cả</Link>
          </div>
          <div className="plate-strip">
            {promotions.slice(0, 4).map((p) => (
              <span key={p.id} className="plate" style={{ color: "var(--ink)", background: "#fff4e0", borderColor: "var(--line)" }}>
                {p.code} · -{p.discountPercent}%
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="section-head">
        <div>
          <h2>Xe nổi bật</h2>
          <p>Được đánh giá cao nhất trên Morent</p>
        </div>
        <Link to="/customer/search" className="link text-sm">Xem toàn bộ danh sách</Link>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <div className="grid grid-3">
          {featured.map((v) => (
            <Link to={`/customer/vehicles/${v.id}`} key={v.id} className="vehicle-card">
              <img className="vehicle-card__img" src={v.image} alt={v.name} />
              <div className="vehicle-card__body">
                <div className="vehicle-card__title">{v.name}</div>
                <div className="vehicle-card__meta">
                  <span>{v.type}</span>
                  <span>{v.location}</span>
                </div>
                <div className="vehicle-card__foot">
                  <div className="price">{formatVND(v.pricePerDay)}<small> /ngày</small></div>
                  {v.rating > 0 && <span className="stars text-sm">★ {v.rating}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
